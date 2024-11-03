"use client";
import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { SignIn } from "@/components/signin";

export default function SignInPage() {
  return (
    <>
      <PageHeader title="Iniciar sesión"></PageHeader>
      <PageContent>
        <SignIn />
      </PageContent>
    </>
  );
}