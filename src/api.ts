import { Account, state } from "./state";

export async function sendForm(url: string, data: Record<string, string>) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    let req = await fetch(url, {
        method: "POST",
        body: formData,
    });

    return await req.json();
}

export async function send(url: string, data: any) {
    let req = await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data),
    });

    return await req.json();
}

export type LoginCreds = {
    username: string
    password: string
    account?: Account
}
export async function auth(login: LoginCreds | null) {
    let { client_id, client_secret } = await sendForm("/api/v1/apps", {
        client_name: "starland-fe",
        redirect_uris: "https://akkoma.mercurywork.shop/oauth-callback",
        scopes: "read write follow push admin"
    })


    if (login) {
        let { error } = await sendForm("/oauth/token", {
            client_id,
            client_secret,
            grant_type: "password",
            username: login.username,
            password: login.password
        });

        if (error) throw error;


        let req = await fetch("/api/v1/accounts/verify_credentials");
        return await req.json();
    }
}
