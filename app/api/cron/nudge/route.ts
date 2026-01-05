import { db } from '@/db/db';
import { usersTable, goalsTable, accountabilityPartnersTable } from '@/db/schema';
import { and, eq, isNotNull, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Dynamic import for SendGrid to handle missing types
async function getSendGrid() {
  if (process.env.SENDGRID_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return sgMail;
  }
  return null;
}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all onboarded users
    const onboardedUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.onboarded, true));

    const nudgesSent: { goalId: number; goal: string; email?: string; phone?: string; reason: string }[] = [];

    for (const user of onboardedUsers) {
      // Get all goals for this user
      const goals = await db
        .select()
        .from(goalsTable)
        .where(eq(goalsTable.userId, user.id));

      for (const goal of goals) {
        // Skip if no reminder cadence set
        if (!goal.reminderCadence) continue;

        const lastCheckIn = goal.lastCheckInAt;
        
        // Determine if goal needs a nudge based on cadence
        let needsNudge = false;
        
        if (goal.reminderCadence === 'daily') {
          // Daily goals: nudge if no check-in in 24+ hours
          needsNudge = !lastCheckIn || lastCheckIn < oneDayAgo;
        } else if (goal.reminderCadence === 'weekly') {
          // Weekly goals: nudge if no check-in in 7+ days
          needsNudge = !lastCheckIn || lastCheckIn < sevenDaysAgo;
        }

        if (!needsNudge) continue;

        // Get all accountability partners for this goal
        const partners = await db
          .select()
          .from(accountabilityPartnersTable)
          .where(eq(accountabilityPartnersTable.goalId, goal.id));

        const lastCheckInStr = lastCheckIn
          ? lastCheckIn.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })
          : 'never';

        // Send notifications to all partners
        for (const partner of partners) {
          // Send email if available
          if (partner.email) {
            try {
              const sgMail = await getSendGrid();
              if (sgMail) {
                await sgMail.send({
                  to: partner.email,
                  from: process.env.SENDGRID_FROM_EMAIL || 'noreply@2026goals.app',
                  subject: '🔔 Your accountability buddy needs encouragement!',
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h1 style="color: #7c3aed;">Accountability Check-in</h1>
                      <p>Hi there!</p>
                      <p>
                        Your accountability buddy hasn't checked in on their 2026 goal since 
                        <strong>${lastCheckInStr}</strong>.
                      </p>
                      <p>Their goal: <em>"${goal.goal}"</em></p>
                      <p>
                        Maybe send them a quick message of encouragement? Sometimes a simple 
                        "How's your goal going?" can make all the difference!
                      </p>
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                      <p style="color: #6b7280; font-size: 14px;">
                        You're receiving this because someone listed you as their accountability buddy 
                        for their 2026 goals.
                      </p>
                    </div>
                  `,
                  text: `
                    Accountability Check-in

                    Your accountability buddy hasn't checked in on their 2026 goal since ${lastCheckInStr}.

                    Their goal: "${goal.goal}"

                    Maybe send them a quick message of encouragement?

                    ---
                    You're receiving this because someone listed you as their accountability buddy.
                  `,
                });

                nudgesSent.push({
                  goalId: goal.id,
                  goal: goal.goal,
                  email: partner.email,
                  reason: `Last check-in: ${lastCheckInStr}`,
                });
              } else {
                // Log for development when SendGrid is not configured
                console.log(`[DEV] Would send email to ${partner.email} for goal: ${goal.goal}`);
                nudgesSent.push({
                  goalId: goal.id,
                  goal: goal.goal,
                  email: partner.email,
                  reason: `[DEV] Last check-in: ${lastCheckInStr}`,
                });
              }
            } catch (emailError) {
              console.error(`Failed to send email to ${partner.email}:`, emailError);
            }
          }

          // SMS placeholder - would integrate with Twilio or similar
          if (partner.phone && !partner.email) {
            console.log(`[SMS PLACEHOLDER] Would send SMS to ${partner.phone} for goal: ${goal.goal}`);
            nudgesSent.push({
              goalId: goal.id,
              goal: goal.goal,
              phone: partner.phone,
              reason: 'SMS fallback - email not available',
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      usersChecked: onboardedUsers.length,
      nudgesSent: nudgesSent.length,
      details: nudgesSent,
    });
  } catch (error) {
    console.error('Cron nudge error:', error);
    return NextResponse.json(
      { error: 'Failed to process nudges' },
      { status: 500 }
    );
  }
}
