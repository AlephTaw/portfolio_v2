import { FiCpu, FiDatabase, FiUploadCloud } from "react-icons/fi";
import { SiPython } from "react-icons/si";

const achievements = [
  { Icon: FiDatabase, label: "SQL" },
  { Icon: SiPython, label: "Python" },
  { Icon: FiCpu, label: "Machine Learning" },
  { Icon: FiUploadCloud, label: "Deployments" },
];

export function Achievements() {
  return (
    <div className="mt-9">
      <p className="w-full whitespace-nowrap text-left text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:text-[0.62rem] sm:tracking-[0.2em]">
        Achievements
      </p>
      <div className="mt-5 flex flex-wrap justify-between gap-y-4 bg-background px-3 py-3">
        {achievements.map(({ Icon, label }) => (
          <div
            className="flex w-24 flex-col items-center text-center"
            key={label}
          >
            <div className="flex size-24 items-center justify-center border-2 border-black bg-[#f7f7f7]">
              <Icon aria-hidden="true" className="size-5 text-[#3f3f3f]" />
            </div>
            <p className="mt-3 text-[0.65rem] leading-4 text-[#3f3f3f]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
