import { Typography } from "@mui/material"

export const Welcome = () => {
  const sx = { mb: '1rem', fontSize: '1.25rem', lineHeight: '1.5' };
  return <>
    <Typography
      variant="h1"
      sx={{ fontSize: '2.5rem', fontWeight: 'bold', mb: '1rem' }}
    >
      Simplifica la gestión de tus alquileres
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      ¡Bienvenido! Hemos diseñado esta herramienta para que los propietarios puedan cobrar sus alquileres de forma automática
      a través de domiciliación bancaria.
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
      Para procesar los pagos utilizamos Stripe, una plataforma de pagos segura. Stripe se encargará de recopilar la autorización
      de tus inquilinos a través del correo electrónico y cobrará periódicamente los alquileres.
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      El dinero llegará a tu cuenta de Stripe y desde allí llegará a la cuenta bancaria que indiques a Stripe.
    </Typography>
    <Typography
      variant="body1"
      sx={sx}
    >
      Tener una cuenta de Stripe es gratuito. Sólo pagarás una comisión de 0,35 € por cada cobro.
    </Typography>
  </>
}