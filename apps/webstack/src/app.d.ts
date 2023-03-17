// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

declare namespace App {
    // interface Error {}
    // interface Locals {}
    interface Locals {
        session: import("svelte-kit-cookie-session").Session<SessionData>;
    }

    type Session = SessionData;

    interface PageData {
        session: SessionData;
    }
    // interface PageData {}
    // interface Platform {}
}

/// <reference types="@sveltejs/kit" />

interface SessionData {
    osu?: {
        id: string;
        username: string;
        joinDate: luxon.DateTime;
        playCount: number;
    };
    reddit?: {
        username: string;
        joinDate: luxon.DateTime;
    };
    discord?: {
        id: string;
        state: string;
    };
    reason?: string;
    error?: string;
}
