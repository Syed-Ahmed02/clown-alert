import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen b flex items-center justify-center p-4">
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
            socialButtonsBlockButtonText: 'text-white',
            dividerLine: 'bg-slate-600',
            dividerText: 'text-slate-400',
            formFieldLabel: 'text-slate-300',
            formFieldInput: 'bg-slate-700 border-slate-600 text-white',
            formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
            footerActionLink: 'text-purple-400 hover:text-purple-300',
            identityPreviewText: 'text-slate-300',
            identityPreviewEditButton: 'text-purple-400',
          },
        }}
      />
    </div>
  );
}

