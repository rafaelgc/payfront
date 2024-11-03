import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";

export default function HelpPage() {
  return (
    <>
      <PageHeader title="Ayuda"></PageHeader>
      <PageContent>
        Si necesitas ayuda escríbenos a <a href="mailto:contact@habitacional.es">contact@habitacional.es</a>
      </PageContent>
    </>
  );
}