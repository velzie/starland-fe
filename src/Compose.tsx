import { sendForm } from "./api";

export type Compose = DLComponent<{
    content: string
    // gahd damn liberals
    cw: string
    sending: boolean
    inputelm: HTMLElement
    replyto: string

    onsend?: () => void
}>;

let style = css`
.composebox {
    width: 100%;
    min-height: 100px;
}
`;

let grayed = rule`background-color: blue`;
export function Compose(this: Compose) {
    this.css = style;

    this.content ??= "";
    this.cw ??= "";

    handle(use(this.content), console.log)

    return (
        <div>
            <input placeholder="content warning" bind:value={use(this.cw)} />
            <textarea
                bind:value={use(this.content)}
                placeholder="shitpost here"
                class="composebox"
            />

            <button class={[grayed]} on:click={async () => {
                this.sending = true;
                $el.classList.toggle(grayed);
                try {
                    await sendForm("/api/v1/statuses", {
                        status: this.content,
                        source: "Pleroma for Nintendo DS",
                        visibility: "direct",
                        content_type: "text/plain",
                        language: "en" //rahhhhh
                    });
                } catch { }
                $el.classList.toggle(grayed);
                this.sending = false;

                if (this.onsend) this.onsend();
            }}>
                Post
            </button>

        </div>
    )
}
