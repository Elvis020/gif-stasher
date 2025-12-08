import React from "react";
import { Plus, Moon, MoreHorizontal, Folder, Send } from "lucide-react";

export default function GifStashUI() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white -rotate-45" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#0A0A0A] tracking-tight">
                GIF Stash
              </h1>
              <p className="text-[14px] text-[#737373] mt-0.5">
                Your meme arsenal
              </p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] flex items-center justify-center transition-colors">
            <Moon
              className="w-[18px] h-[18px] text-[#737373]"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Input Section */}
        <div className="flex gap-2.5 mb-10">
          <input
            type="text"
            placeholder="Paste Twitter/X URL here..."
            className="flex-1 px-4 py-3 bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent text-[#0A0A0A] placeholder-[#A3A3A3] text-[15px]"
          />
          <select
            className="px-4 py-3 bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent text-[#0A0A0A] min-w-[150px] text-[15px] appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
          >
            <option>No folder</option>
            <option>Reactions</option>
            <option>Wholesome</option>
            <option>Chaos</option>
          </select>
          <button className="w-11 h-11 rounded-lg bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] flex items-center justify-center transition-colors">
            <Plus
              className="w-[18px] h-[18px] text-[#737373]"
              strokeWidth={2}
            />
          </button>
          <button className="px-6 py-3 bg-[#0A0A0A] hover:bg-[#262626] text-white rounded-lg font-medium flex items-center gap-2 transition-all text-[15px]">
            <Send className="w-4 h-4" strokeWidth={2} />
            Save
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 bg-[#0A0A0A] text-white whitespace-nowrap">
            <Folder className="w-4 h-4" strokeWidth={2} />
            <span className="text-[14px]">All</span>
            <span className="text-[13px] bg-white/15 px-1.5 py-0.5 rounded">
              6
            </span>
          </button>

          <button className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#FAFAFA] whitespace-nowrap">
            <Folder className="w-4 h-4 text-[#737373]" strokeWidth={2} />
            <span className="text-[14px]">Reactions</span>
            <span className="text-[13px] text-[#737373] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
              3
            </span>
            <MoreHorizontal
              className="w-4 h-4 text-[#A3A3A3] ml-0.5"
              strokeWidth={2}
            />
          </button>

          <button className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#FAFAFA] whitespace-nowrap">
            <Folder className="w-4 h-4 text-[#737373]" strokeWidth={2} />
            <span className="text-[14px]">Wholesome</span>
            <span className="text-[13px] text-[#737373] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
              1
            </span>
            <MoreHorizontal
              className="w-4 h-4 text-[#A3A3A3] ml-0.5"
              strokeWidth={2}
            />
          </button>

          <button className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#FAFAFA] whitespace-nowrap">
            <Folder className="w-4 h-4 text-[#737373]" strokeWidth={2} />
            <span className="text-[14px]">Chaos</span>
            <span className="text-[13px] text-[#737373] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
              1
            </span>
            <MoreHorizontal
              className="w-4 h-4 text-[#A3A3A3] ml-0.5"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* GIF Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            "34567890",
            "45678901",
            "56789012",
            "67890123",
            "78901234",
            "89012345",
          ].map((id) => (
            <div
              key={id}
              className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all border border-[#E5E5E5] hover:border-[#A3A3A3] cursor-pointer group"
            >
              <div className="aspect-square bg-linear-to-br from-[#F5F5F5] to-[#E5E5E5] flex items-center justify-center relative overflow-hidden">
                <span className="text-[64px] font-semibold text-[#D4D4D4] group-hover:text-[#A3A3A3] transition-all tracking-tight">
                  GIF
                </span>
              </div>
              <div className="px-3.5 py-2.5 bg-white border-t border-[#F5F5F5]">
                <p className="text-[13px] text-[#737373] font-mono">_{id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
