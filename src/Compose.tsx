import { sendForm } from "./api";
import { borderbox, col, flex, gap, h100, w100 } from "./css";
import { Container } from "./main";

let style = css`

self {
    gap: 0.5em;
}

textarea, input {
    border: none;
}

button {
    width: 200px;
    border: none;
    background-color: var(--accent);
}
`;

let grayed = rule`background-color: blue`;
export const Compose: Component<{
    content?: string
    // gahd damn liberals
    cw?: string
    onsend?: () => void
}, {
    inputelm: HTMLElement
    sending: boolean
}> = function() {
    this.css = style;

    this.content ??= "";
    this.cw ??= "";

    return (
        <div class={[flex, col, borderbox, gap]}>
            <input placeholder="content warning" bind:value={use(this.cw)} />
            <textarea
                bind:value={use(this.content)}
                placeholder="shitpost here"
                class={[w100, h100, rule`resize: none`, borderbox]}
            />

            <div class={[flex, w100]}>
                <div>
                    visibility
                </div>
                <button class={[grayed]} on:click={async () => {
                    this.sending = true;
                    $el.classList.toggle(grayed);
                    try {
                        await sendForm("/api/v1/statuses", {
                            status: this.content!,
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
        </div>
    )
}
