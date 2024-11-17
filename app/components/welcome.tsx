import { Typography } from "@mui/material"

export const Welcome = () => {
  const sx = { mb: '1rem', fontSize: '1.25rem', lineHeight: '1.5' };
  return <>
    <Typography
      variant="h1"
      sx={{ fontSize: '2.5rem', fontWeight: 'bold', mb: '1rem' }}
    >
      Automatiza el cobro de tus alquileres
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      A través de Payfront podrás configurar fácilmente la domiciliación bancaria para que puedas cobrar tus alquileres de forma automática y 100% online.
    </Typography>
    <Typography
      variant="h2"
      sx={{ fontSize: '1.5rem', fontWeight: 'bold', mb: '0.5rem', mt: '2rem' }}
    >
      ¿Cómo funciona?
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      Para procesar los pagos utilizamos <a href="https://stripe.com/es" target="_blank">Stripe</a>, una plataforma de pagos segura. Stripe se encargará de recopilar la autorización de domiciliación
      de tus inquilinos por correo electrónico y cobrará periódicamente los alquileres a través de adeudos directos SEPA.
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      El dinero llegará a tu cuenta de Stripe y desde allí se transferirá a tu cuenta bancaria.
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      Tener una cuenta de Stripe es gratuito. Sólo pagarás una comisión de 0,35 € por cada cobro.
    </Typography>
  </>
}