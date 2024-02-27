import { sendForm } from "./api";
import { borderbox, col, flex, gap, h100, hcenter, scrolly, w100, wevenly } from "./css";
import { Container } from "./Container";
import { KnownStatus } from "./state";

const Visibility = {
    direct: 0,
    private: 1,
    local: 2,
    unlisted: 3,
    public: 4
} as const;

let grayed = rule`background-color: blue`;
export const Compose: Component<{
    replyto?: KnownStatus
    content?: string
    // gahd damn liberals
    cw?: string
    onsend?: () => void
}, {
    files: ComponentElement<typeof FileView>[]
    inputelm: HTMLElement
    sending: boolean
    visibility: keyof typeof Visibility
}> = function() {
    this.css = css`
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

.visibility {
    .active {
        color: var(--accent);
    }
}
`;
    this.visibility = this.replyto?.object.visibility || "public";

    this.files = [];
    this.content ??= "";
    this.cw ??= "";

    return (
        <div class={[flex, col, borderbox, gap, scrolly]}>
            <input placeholder="content warning" bind:value={use(this.cw)} />
            <textarea
                bind:value={use(this.content)}
                on:paste={(e: ClipboardEvent) => {
                    for (const item of e.clipboardData?.files!) {
                        let view = <FileView close={() => this.files = this.files.filter(v => v != view)} file={item} />;
                        this.files = [...this.files, view]
                        e.preventDefault();
                    }
                }}
                placeholder="shitpost here"
                class={[w100, h100, rule`resize: none`, borderbox]}
            />
            {$if(use(this.files.length),
                <div>
                    {use(this.files)}
                </div>
            )}

            <div class={[flex, hcenter, w100, gap]}>
                <div class={[flex, hcenter, gap, "visibility"]}>
                    <iconify-icon class={[use(this.visibility, (v: any) => v == "direct" && "active")]} on:click={() => this.visibility = "direct"} icon="fa:envelope" />
                    {
                        !this.replyto || Visibility[this.replyto.object.visibility] > Visibility.direct ?
                            <>
                                <iconify-icon class={[use(this.visibility, (v: any) => v == "private" && "active")]} on:click={() => this.visibility = "private"} icon="fa:lock" />
                                {
                                    !this.replyto || Visibility[this.replyto.object.visibility] > Visibility.private ?
                                        <>
                                            <iconify-icon class={[use(this.visibility, (v: any) => v == "unlisted" && "active")]} on:click={() => this.visibility = "unlisted"} icon="fa-solid:lock-open" />
                                            {
                                                !this.replyto || Visibility[this.replyto.object.visibility] > Visibility.unlisted ?
                                                    <iconify-icon class={[use(this.visibility, (v: any) => v == "public" && "active")]} on:click={() => this.visibility = "public"} icon="fa:globe" />
                                                    : ""
                                            }
                                        </>
                                        : ""
                                }
                            </>
                            : ""
                    }
                </div>
                <button class={[grayed]} on:click={async () => {
                    this.sending = true;
                    $el.classList.toggle(grayed);
                    try {
                        let payload: any = {
                            status: this.content!,
                            source: "Pleroma for Nintendo DS",
                            visibility: this.visibility,
                            content_type: "text/plain",
                            language: "en" //rahhhhh
                        };
                        if (this.replyto)
                            payload.in_reply_to_id = this.replyto.id;
                        await sendForm("/api/v1/statuses", payload);
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

const FileView: Component<{
    file: File
    altText: string
    close: () => void
}, {
    dataurl: string
}, "altText"> = function() {
    this.css = css`
self {
    padding: 1em;

    border-radius: 10px;
    background: #1a1a1a;
}
iconify-icon {
    transform: scale(150%);
}
`;
    let fr = new FileReader();
    fr.onload = () => {
        this.dataurl = fr.result as string;
    };
    fr.readAsDataURL(this.file);

    return (
        <div class={[flex, col]}>
            <div class={[flex, wevenly]}>
                <iconify-icon on:click={this.close} icon="fa:close" />
            </div>
            {use(this.dataurl, _ => {
                if (this.file.type.startsWith("image")) {
                    return <>
                        <img src={this.dataurl} alt={use(this.altText)} />
                        <input bind:value={use(this.altText)} />
                    </>
                }


                return "unsupported data type :("
            })}
        </div>
    )
}
