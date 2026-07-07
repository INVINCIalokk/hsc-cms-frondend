"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

export default function Home() {
  const items = [
    { label: "CBSE", value: "cbse" },
    { label: "SSC", value: "ssc" },
    { label: "ICSE", value: "icse" },
    { label: "HSC--adjasdfkldjfalsj", value: "hsc" },
  ];

  const standardItems = [
    { value: "10th", label: "10th Grade" },
    { value: "12th", label: "12th Grade" },
  ];

  const subjectItems = [
    { value: "math", label: "Mathematics" },
    { value: "science", label: "Science" },
  ];
  return (
    <div className="flex sm:flex-row flex-col h-[50vh] md:h-[75vh] justify-center gap-10  items-center w-full max-w-7xl mx-auto">
      {/* Board Select */}
      <div>
        <Select items={items}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select your board"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Standard Select */}
      <div>
        <Select items={standardItems}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select your standard"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {standardItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Subject Select */}
      <div>
        <Select items={subjectItems}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select your subject"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {subjectItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
