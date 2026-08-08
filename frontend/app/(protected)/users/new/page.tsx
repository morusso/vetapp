"use client";

import { useRouter } from "next/navigation";
import { createUser } from "@/lib/users";
import UserForm from "../UserForm";

export default function NewUserPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 justify-center p-6">
      <UserForm
        title="New user"
        submitLabel="Create"
        initialValues={{
          email: "",
          password: "",
          password_confirm: "",
          first_name: "",
          last_name: "",
          phone_number: "",
          specializations: [],
          is_staff: false,
          is_active: true,
        }}
        onSubmit={async (values) => {
          await createUser(values);
          router.push("/users");
        }}
      />
    </main>
  );
}
