import { Typography } from "@mui/material"

export const Welcome = () => {
  return <>
    <Typography
      variant="h1"
      sx={{ fontSize: '2.5rem', fontWeight: 'bold', mb: '1rem' }}
    >
      Simplifica la gestión de tus alquileres
    </Typography>
    <Typography
      variant="body1"
      sx={{ mb: '1rem', fontSize: '1.25rem', lineHeight: '1.5' }}
    >
      ¡Bienvenido! Hemos diseñado una herramienta fácil y segura para que propietarios
      como tú gestionen los pagos de alquiler de habitaciones de manera automática, sin complicaciones.
      Con esta herramienta podrás cobrar a tus inquilinos de forma rápida y segura a través de domiciliación bancaria.
    </Typography>
  </>
}