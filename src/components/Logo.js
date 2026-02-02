import Link from "next/link";
import Image from "next/image";

const Logo = ({flink}) => {
  return (
    <Link href={flink ? flink : "/"} className="flex items-center gap-2 group">
      <Image src="/logo.png" alt="Logo" width={32} height={32} />

      <div className="flex items-center bg-transparent">
        <span className="text-blue-600 dark:text-blue-500 font-bold text-2xl mr-1">
          AA
        </span>
        <span className="text-gray-600 dark:text-gray-400 font-bold text-2xl">
          SoftLabs
        </span>
        <span className="text-gray-600 dark:text-gray-400 text-sm align-super ml-1">
          ™
        </span>
      </div>
    </Link>
  );
};

export default Logo;
