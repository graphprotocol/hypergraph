export function PublishedToKnowledgeGraphDark(props: React.ComponentProps<'svg'>) {
  return (
    <span className="hidden dark:inline-block">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden dark:inline-block"
        {...props}
      >
        <title>Published to Knowledge Graph</title>
        <g clipPath="url(#clip0_59284_4458)">
          <circle cx="8.0032" cy="1.75" r="1.25" stroke="white" />
          <circle cx="8.0032" cy="14.25" r="1.25" stroke="white" />
          <path d="M7.99641 13.255L8.0032 2.75" stroke="white" />
          <circle cx="13.4159" cy="5.125" r="1.25" transform="rotate(60 13.4159 5.125)" stroke="white" />
          <circle cx="2.59055" cy="11.375" r="1.25" transform="rotate(60 2.59055 11.375)" stroke="white" />
          <path d="M3.44885 10.8716L12.5498 5.625" stroke="white" />
          <circle cx="13.4159" cy="11.375" r="1.25" transform="rotate(120 13.4159 11.375)" stroke="white" />
          <circle cx="2.59055" cy="5.125" r="1.25" transform="rotate(120 2.59055 5.125)" stroke="white" />
          <path d="M3.45564 5.61662L12.5498 10.875" stroke="white" />
        </g>
        <defs>
          {/* biome-ignore lint/correctness/useUniqueElementIds: fine to have it hardcoded */}
          <clipPath id="clip0_59284_4458">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
}
export function PublishedToKnowledgeGraphLight(props: React.ComponentProps<'svg'>) {
  return (
    <span className="inline-block dark:hidden">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline-block dark:hidden"
        {...props}
      >
        <title>Published to Knowledge Graph</title>
        <g clipPath="url(#clip0_59285_4572)">
          <circle cx="8.0032" cy="1.75" r="1.25" stroke="#2A2A2A" />
          <circle cx="8.0032" cy="14.25" r="1.25" stroke="#2A2A2A" />
          <path d="M7.99641 13.255L8.0032 2.75" stroke="#2A2A2A" />
          <circle cx="13.4159" cy="5.125" r="1.25" transform="rotate(60 13.4159 5.125)" stroke="#2A2A2A" />
          <circle cx="2.59055" cy="11.375" r="1.25" transform="rotate(60 2.59055 11.375)" stroke="#2A2A2A" />
          <path d="M3.44885 10.8716L12.5498 5.625" stroke="#2A2A2A" />
          <circle cx="13.4159" cy="11.375" r="1.25" transform="rotate(120 13.4159 11.375)" stroke="#2A2A2A" />
          <circle cx="2.59055" cy="5.125" r="1.25" transform="rotate(120 2.59055 5.125)" stroke="#2A2A2A" />
          <path d="M3.45564 5.61662L12.5498 10.875" stroke="#2A2A2A" />
        </g>
        <defs>
          {/* biome-ignore lint/correctness/useUniqueElementIds: fine to have it hardcoded */}
          <clipPath id="clip0_59285_4572">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
}
export function PublishedToKnowledgeGraphIcon(props: React.ComponentProps<'svg'>) {
  return (
    <>
      <PublishedToKnowledgeGraphDark {...props} />
      <PublishedToKnowledgeGraphLight {...props} />
    </>
  );
}
