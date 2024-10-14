import { Paper, SxProps } from "@mui/material";

interface PageContentProps {
  sx?: SxProps;
  children: React.ReactNode;
}

export default function PageContent({
  sx,
  children
}: PageContentProps): JSX.Element {
  return <>
    <Paper
      sx={{
        p: 2,
        ...sx
      }}
    >{children}</Paper>
  </>
}