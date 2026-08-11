const optimizeCloudinaryURL = (url: string): string => {
  if (!url || !url.includes("/upload/")) return url;

  if (url.includes("/f_auto")) return url;

  return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
};

export default optimizeCloudinaryURL;
