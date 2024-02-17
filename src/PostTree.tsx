import { borderbox, w100 } from "./css";
import { Post } from "./Post"

export type PostTree = DLComponent<{
    id: string
}>

let tcss = css`
self {
    /* border-top: 1px solid var(--accent); */
    /* padding-top: 1em; */
    /* padding-bottom: 1em; */
    padding: 1em;

    border-radius: 10px;
    background: #1a1a1a;
}
`;
export function PostTree(this: PostTree) {
    this.css = tcss;

    // api/v1/statuses/AewePz6DKs0pNKk5DM/context

    return (
        <div class={[w100, borderbox]}>
            <Post id={this.id} timestamp={new Date} />
        </div>
    )
}
