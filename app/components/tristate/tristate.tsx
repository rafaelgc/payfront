interface TristateProps {
    children: any[];
    observed: any;
}

export const Tristate = ({ children, observed }: TristateProps) => {
    if (observed === undefined || observed === null) {
        return <>{children[0]}</>
    }
    if (Array.isArray(observed) && observed.length === 0) {
        return <>{children[1]}</>
    }
    return <>{children[2]}</>
}