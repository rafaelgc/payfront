import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { Typography } from "@mui/material";
import styles from './page.module.css'

export default function HelpPage() {
  return (
    <>
      <PageHeader title="Ayuda"></PageHeader>
      <PageContent className={styles.pageContent}>
        <Typography>
          Si necesitas ayuda escríbenos a <a href="mailto:contact@habitacional.es">contact@habitacional.es</a>
        </Typography>

        <Typography variant="h5">
          Dudas frecuentes
        </Typography>

        <Typography variant="h6">
          1. ¿Qué es la domiciliación bancaria?
        </Typography>
        <Typography>
          La domiciliación bancaria es un método de pago en el que el cliente autoriza al proveedor de un
          servicio o al propietario de un inmueble a retirar fondos directamente de su cuenta bancaria. En
          el contexto de alquiler, permite al propietario cobrar el alquiler automáticamente cada mes, sin
          que el inquilino tenga que realizar la transferencia manualmente. Adicionalmente, le permite
          retirar cantiadades arbitrarias para cubrir, por ejemplo, los gastos de suministros.
        </Typography>

        <Typography variant="h6">
          2. ¿Cómo se obtiene la autorización del inquilino?
        </Typography>
        <Typography>
          Desde Payfront nos encargamos de obtener la autorización de tu inquilino a través por correo
          electrónico. Cuando llegue el primer cobro de la renta, el inquilino recibirá un email desde
          el que podrá dar su información bancaria y autorizar el cobro. A partir de ese momento, los
          siguientes pagos se podrán realizar automáticamente, sin necesidad de que el inquilino tenga que
          realizar nuevas autorizaciones.
        </Typography>

        <Typography variant="h6">
          3. ¿Qué pasa si el inquilino no autoriza la domiciliación bancaria?
        </Typography>
        <Typography>
          Si el inquilino no autoriza la domiciliación bancaria, el propietario no podrá cobrar
          automáticamente el alquiler. Desde Payfront podrás ver cuándo el inquilino ha autorizado el pago.
          Te recomendamos que en tu contrato de alquiler especifiques que el inquilino se obliga a autorizar
          la domiciliación bancaria. Asimismo, te recomendamos que te reserves el derecho a cambiar el método
          de pago por si hubiese algún inconveniente que hiciese imposible la domiciliación bancaria.
        </Typography>

        <Typography variant="h6">
          4. ¿Es necesario ser empresa o autónomo para cobrar a través de domiciliación bancaria?
        </Typography>
        <Typography>
          No, los particulares también pueden. Al menos en el contexto de la Unión Europea, donde las
          domiciliaciones bancarias se implementan a través del denominado
          "<a href="https://www.sepaesp.es/f/websepa/secciones/faqs/Ficheros/Ficha_Adeudos_Directos_SEPA.pdf" target="_blank">adeudo directo SEPA</a>", este
          medio de pago está disponible para particulares y empresas por igual.
        </Typography>


        <Typography variant="h6">
          5. ¿Qué pasa si el inquilino no tiene fondos en la cuenta?
        </Typography>
        <Typography>
          Si el inquilino no tiene fondos suficientes en su cuenta cuando se intenta realizar el cobro mediante
          domiciliación bancaria, el pago será rechazado. Desde Payfront podrás hacer seguimiento del estado de
          todos los pagos.
        </Typography>

        <Typography variant="h6">
          6. ¿Qué es Stripe?
        </Typography>
        <Typography>
          Stripe es una plataforma de pagos en línea que permite procesar pagos electrónicos.
        </Typography>
        <Typography>
          En Payfront utilizamos Stripe para procesar los pagos. Cuando te registres en Payfront, te redirigiremos
          a Stripe para que les proporciones algunos datos (como la cuenta bancaria donde quieres recibirás la renta).
          Payfront se encargará de comunicarse con Stripe para realizar los cobros a tus inquilinos.
        </Typography>

        <Typography variant="h6">
          7. ¿Qué ventajas tiene la domiciliación bancaria?
        </Typography>
        <Typography>
          La domiciliación bancaria tiene varias ventajas:
        </Typography>
        
        <Typography component={'ul'} className={styles.list}>
            <li>Automatización del cobro: no necesitas recordar a tus inquilinos que paguen el alquiler.</li>
            <li>Mayor flexibilidad: puedes cobrar cantiadades arbitrarias para cubrir, por ejemplo, los gastos de suministros.</li>
        </Typography>
        <Typography>
          Todo esto redunda en una mayor eficiencia y comodidad para ambas partes.
        </Typography>

        <Typography variant="h6">
          8. ¿Qué desventajas tiene la domiciliación bancaria?
        </Typography>
        <Typography>
          La domiciación bancaria tiene dos principales desventajas:
        </Typography>
        <Typography component={'ul'} className={styles.list}>
          <li>Tiempo de procesamiento del pago: el pago puede tardar varios días en llegar a tu cuenta bancaria.</li>
          <li>El inquilino puede rechazar los pagos hasta 8 semanas después de haberse realizado.</li>
        </Typography>
        <Typography>
          Te recomendamos que uses la domiciliación bancaria si confías en tus inqulinos.
        </Typography>

        <Typography sx={{ mt: 4, mb: 4}}>
          Si tienes alguna duda escríbenos a <a href="mailto:contact@habitacional.es">contact@habitacional.es</a>
        </Typography>
      </PageContent>
    </>
  );
}