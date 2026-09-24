function PostCard({ post }) {
  return (
    <article className="w-full overflow-hidden border-b border-stone-200 py-5 first:pt-0 sm:py-6 md:py-7">
      <h2 className="font-serif text-2xl font-semibold break-words">{post.title}</h2>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-stone-700 sm:text-base">{post.body}</p>
    </article>
  );
}

export default PostCard;
