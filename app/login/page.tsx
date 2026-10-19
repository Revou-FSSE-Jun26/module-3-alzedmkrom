// app/login/page.tsx
//
// The /login route. A thin page that centres the LoginForm; all the behaviour —
// controlled inputs, both-non-empty validation, role-based redirect and inline
// API error — lives in the form component. RedirectIfAuthenticated pushes an
// already-logged-in visitor away from this page (ADMIN to /dashboard, everyone
// else to /) so a signed-in user never sees the login form.

import LoginForm from '@/components/LoginForm';
import RedirectIfAuthenticated from '@/components/RedirectIfAuthenticated';

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <RedirectIfAuthenticated>
        <LoginForm />
      </RedirectIfAuthenticated>
    </main>
  );
}
