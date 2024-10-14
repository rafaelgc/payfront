import { getenv } from "@/env";
import { hash } from "crypto";
import { NextRequest } from "next/server";

export const validate = (req: NextRequest) => {
    const authorization = req.headers.get('Authorization');
    // It should be a Bearer token. The Bearer token should contain two parts separated by :, the first part is the account id and the second part is the token.

    if (!authorization) {
        throw new Error('No Authorization header provided');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2) {
        throw new Error('Authorization header should contain two parts');
    }

    let [accountId, token] = parts[1].split(':');

    if (!accountId || !token) {
        throw new Error('Authorization header should contain two parts');
    }

    if (accountId === 'master') {
        if (token !== getenv('MASTER_TOKEN', '')) {
            throw new Error('Invalid token');
        }
    }
    else {
        if (!verifyToken(accountId, token)) {
            throw new Error('Invalid token');
        }
    }

    return {
        accountId: accountId === 'master' ? undefined : accountId
    };
};

export const generateToken = (accountId: string) => {
    return hash('sha256', 'v1' + getenv('RAND_SEED', 'rand123') + accountId);
}

export const verifyToken = (accountId: string, token: string) => {
    return token === generateToken(accountId);
}