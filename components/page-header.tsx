import { Box, Button, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  children,
  title,
}: PageHeaderProps): JSX.Element {
  return <>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 3,
      }}
    >
      <Typography
        data-testid="page-title"
        sx={{
          fontWeight: 'bold',
          fontSize: '1.2em',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  </>
}