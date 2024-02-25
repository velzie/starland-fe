import { LoginCreds } from "./api";

export const state: {
    user: Account | null
} = stateful({
    user: null
});

export const store: {
    activeacc: number | null
    accounts: LoginCreds[]
} = $store({
    activeacc: null,
    accounts: []
}, "store", "localstorage");

Object.assign(window, { state, store });

const API = "/api";

export type Account = {
    [key: string]: any
    acct: string
    id: string
    url: string
    username: string
    avatar: string
    pleroma: {
        favicon: string
    }
}
export type Attachment = {
    blurhash: string
    description: string
    id: string
    meta: any
    pleroma: { mime_type: string }
    preview_url: string
    remote_url: string
    text_url: string
    type: "image"
    url: string
}
export type Status = {
    [key: string]: any
    created_at: string
    id: string
    account: Account
    mentions: Account[]
    in_reply_to_id: string | null
    in_reply_to_account_id: string | null
    media_attachments: Attachment[]
    reblog: Status | null
};

export type KnownStatus = Stateful<{
    object: Stateful<Status>
    favouriting: boolean
    reblogging: boolean
    id: string
}>

export const statuses: Map<string, KnownStatus> = new Map;

export type KnownAccount = Stateful<{
    account: Account,
    id: string
}>

export const accounts: Map<string, KnownAccount> = new Map;


(window as any).a = statuses;


export async function parseStatus(object: Status): Promise<KnownStatus> {
    const { id, in_reply_to_id, reblog } = object;

    for (let acc of object.mentions) {
        if (!accounts.has(acc.id)) {
            let resp = await fetch(`/api/v1/accounts/${acc.id}/?with_relationships=true`)
            let account = await resp.json();
            parseAccount(account);
        }
    }

    if (reblog) {
        await parseStatus(reblog);
    }

    if (in_reply_to_id) {
        // /context
        let resp = await fetch(`/api/v1/statuses/${in_reply_to_id}`);
        let status = await resp.json();
        await parseStatus(status);
    }

    if (statuses.has(id)) {
        let tl = statuses.get(id)!;
        tl.object = stateful(object);
        return tl;
    } else {
        let withstate: KnownStatus = stateful({
            id,
            favouriting: false,
            reblogging: false,
            object: stateful(object),
        });
        statuses.set(id, withstate);
        return withstate;
    }
}
export function parseAccount(account: Account): KnownAccount {
    const { id } = account;

    if (accounts.has(id)) {
        let acct = accounts.get(id)!;
        acct.account = stateful(account);
        return acct;
    } else {
        let withstate = stateful({
            id,
            account: stateful(account),
        });
        accounts.set(id, withstate);
        return withstate;
    }
}
