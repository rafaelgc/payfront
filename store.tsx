"use client";
import { createContext, useReducer } from "react";

export interface GlobalState {
    token: string;
    loadingToken: boolean;
};

export const initialState: GlobalState = {
    token: '',
    loadingToken: true,
};

export const StoreContext = createContext({
    state: initialState,
    dispatch: (action: any) => {
        console.log('No provider found for StoreContext');
    },
});

export enum ACTIONS {
    SET_TOKEN,
}

export type Action = { type: ACTIONS; payload: any };

interface StateProviderProps{
    children?: any;
};

export const StateProvider = ({ children }: StateProviderProps) => {
    const [state, dispatch] = useReducer((state: GlobalState, action: Action) => {
        switch (action.type) {
            case ACTIONS.SET_TOKEN:
                return {
                    ...state,
                    token: action.payload,
                    loadingToken: false,
                };
            default:
                console.log('Unrecognized action:', action);
                return state;
        }
    }, initialState);
    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
};