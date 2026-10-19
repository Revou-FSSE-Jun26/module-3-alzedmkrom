// app/register/page.tsx
//
// The /register route. A thin page that centres the RegisterForm; all the
// behaviour — controlled inputs, validation, role-based redirect and inline API
// error — lives in the form component. RedirectIfAuthenticated pushes an
// already-logged-in visitor away from this page (ADMIN to /dashboard, everyone
// else to /) so a signed-in user never sees the registration form.

import RegisterForm from '@/components/RegisterForm';
import RedirectIfAuthenticated from '@/components/RedirectIfAuthenticated';

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <RedirectIfAuthenticated>
        <RegisterForm />
      </RedirectIfAuthenticated>
    </main>
  );
}
