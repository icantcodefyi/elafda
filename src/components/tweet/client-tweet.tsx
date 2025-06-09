"use client";

import { type TweetProps, useTweet } from "react-tweet";

import { MagicTweet, TweetNotFound, TweetSkeleton } from "./magic-tweet";

export const ClientTweetCard = ({
  id,
  apiUrl,
  fallback = <TweetSkeleton />,
  components,
  fetchOptions,
  onError,
  ...props
}: TweetProps & { className?: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading } = useTweet(id, apiUrl, fetchOptions);

  if (isLoading) return fallback;
  if (error || !data) {
    const NotFound = components?.TweetNotFound ?? TweetNotFound;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return <NotFound error={onError ? onError(error) : error} />;
  }

  return <MagicTweet tweet={data} components={components} {...props} />;
};
