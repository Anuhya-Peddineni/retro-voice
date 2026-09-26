interface NoticeBannerProps {
  tone: 'error' | 'success' | 'info';
  message: string;
}

export function NoticeBanner({ tone, message }: NoticeBannerProps) {
  return <div className={`notice notice--${tone}`}>{message}</div>;
}

