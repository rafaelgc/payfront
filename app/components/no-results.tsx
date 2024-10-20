import { Typography } from "@mui/material";

interface NoResultsProps {
    children: React.ReactNode | React.ReactNode[];
}

export function NoResults({ children }: NoResultsProps) {
    return (
        <Typography variant="body2" textAlign={'center'}>{children}</Typography>
    );
}