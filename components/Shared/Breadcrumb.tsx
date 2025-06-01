import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  pageName: string;
  description?: string;
  breadcrumbItems?: Array<{
    label: string;
    href: string;
  }>;
}

const Breadcrumb = ({ pageName, description, breadcrumbItems = [] }: BreadcrumbProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          {pageName}
        </h2>

        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" href="/dashboard">
                Dashboard
              </Link>
            </li>
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <Link className="font-medium" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="text-primary">{pageName}</span>
            </li>
          </ol>
        </nav>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

export default Breadcrumb;