"use client";
import PageContent from "@/app/components/page-content";
import PageHeader from "@/app/components/page-header";
import { SignIn } from "@/app/components/signin/signin";

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