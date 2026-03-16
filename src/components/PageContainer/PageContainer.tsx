import './PageContainer.css';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`page-container ${className}`.trim()}>
      {children}
    </div>
  );
}
