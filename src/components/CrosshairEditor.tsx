import React from 'react';
import { CrosshairSettings } from '../types';
import { gameAudio } from '../audio';
import { Target, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

interface CrosshairEditorProps {
  settings: CrosshairSettings;
  onChange: (settings: CrosshairSettings) => void;
}

const PRESET_COLORS = [
  '#00ff00', // Neon Green
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ffffff', // White
  '#ff3b30', // Alert Red
  '#ff9500', // Vibrant Orange
];

export const DEFAULT_CROSSHAIR: CrosshairSettings = {
  size: 8,
  thickness: 2,
  gap: 4,
  color: '#00ff00',
  outline: true,
  outlineColor: '#000000',
  dot: false,
  dynamicBloom: true,
};

export const CrosshairEditor: React.FC<CrosshairEditorProps> = ({ settings, onChange }) => {
  const updateSetting = <K extends keyof CrosshairSettings>(key: K, value: CrosshairSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    gameAudio.playClickSound();
    onChange(DEFAULT_CROSSHAIR);
  };

  const handleRandomize = () => {
    gameAudio.playClickSound();
    onChange({
      size: Math.floor(Math.random() * 15) + 4,
      thickness: Math.floor(Math.random() * 4) + 1,
      gap: Math.floor(Math.random() * 12) + 1,
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      outline: Math.random() > 0.3,
      outlineColor: '#000000',
      dot: Math.random() > 0.5,
      dynamicBloom: Math.random() > 0.3,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800" id="crosshair-editor-panel">
      {/* Parameters Editor */}
      <div className="lg:col-span-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="font-sans font-bold text-lg text-white">조준점 커스터마이징</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all border border-indigo-500/20"
              title="조준점 무작위 생성하기"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>랜덤생성</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-slate-700"
              title="기본 설정으로 되돌리기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* Size Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>조준선 길이 (ARM LENGTH)</span>
            <span className="font-mono text-emerald-400 font-bold">{settings.size}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={settings.size}
            onChange={(e) => {
              updateSetting('size', parseInt(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Thickness Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>조준선 두께 (ARM THICKNESS)</span>
            <span className="font-mono text-emerald-400 font-bold">{settings.thickness}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={settings.thickness}
            onChange={(e) => {
              updateSetting('thickness', parseInt(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Gap Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>중앙 간격 (INNER GAP)</span>
            <span className="font-mono text-emerald-400 font-bold">{settings.gap}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={settings.gap}
            onChange={(e) => {
              updateSetting('gap', parseInt(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Colors Picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">조준점 에임 색상</label>
          <div className="flex gap-2.5 flex-wrap items-center">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                 onClick={() => {
                  gameAudio.playClickSound();
                  updateSetting('color', color);
                }}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-lg cursor-pointer hover:scale-110 active:scale-95 transition-all border-2 ${
                  settings.color === color ? 'border-white ring-2 ring-emerald-400/50 scale-110' : 'border-transparent'
                }`}
              />
            ))}
            <div className="flex items-center gap-1.5 bg-slate-800/80 pl-2.5 pr-1.5 py-1 rounded-lg border border-slate-700 ml-auto">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">색값</span>
              <input
                type="color"
                value={settings.color}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Boolean Controls */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">중앙 센터 도트</div>
              <div className="text-[10px] text-slate-400">화면 정중앙에 에임 점 추가</div>
            </div>
            <button
              onClick={() => {
                gameAudio.playClickSound();
                updateSetting('dot', !settings.dot);
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-all outline-none cursor-pointer ${
                settings.dot ? 'bg-emerald-500 flex justify-end' : 'bg-slate-700 flex justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">검정색 외곽선</div>
              <div className="text-[10px] text-slate-400">눈동자 시계성 확보용 윤곽라인</div>
            </div>
            <button
              onClick={() => {
                gameAudio.playClickSound();
                updateSetting('outline', !settings.outline);
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-all outline-none cursor-pointer ${
                settings.outline ? 'bg-emerald-500 flex justify-end' : 'bg-slate-700 flex justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between col-span-2">
            <div>
              <div className="text-xs font-bold text-white">이동 및 사격 시 탄확산 변동 (다이내믹 블룸)</div>
              <div className="text-[10px] text-slate-400">인게임에서 걷거나 무기를 난사할 때 탄퍼짐에 맞춰 조준선 간격이 점차 벌어집니다.</div>
            </div>
            <button
              onClick={() => {
                gameAudio.playClickSound();
                updateSetting('dynamicBloom', !settings.dynamicBloom);
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-all outline-none cursor-pointer ${
                settings.dynamicBloom ? 'bg-emerald-500 flex justify-end' : 'bg-slate-700 flex justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Crosshair Simulation Sandbox Panel */}
      <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[300px]">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-indigo-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            실시간 샌드박스 미리보기
          </span>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">
            가상 타겟 헤드 조준 중
          </span>
        </div>

        {/* Dynamic Canvas preview */}
        <div className="relative w-full aspect-square max-w-[240px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center shadow-inner group">
          {/* Target background backdrop patterns for testing contrast */}
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="bg-slate-900 border-r border-slate-800/20" title="Dark environment test"></div>
            <div className="bg-emerald-950/40" title="Grassland environment test"></div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent"></div>

          {/* Dummy Target in the center */}
          <div className="absolute w-12 h-16 flex flex-col items-center justify-center animate-bounce duration-1000">
            {/* Robo Head */}
            <div className="w-5 h-5 rounded-md bg-orange-400/80 border border-orange-500/90 shadow-lg relative flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-1"></div>
              <div className="w-1 h-1 bg-white rounded-full absolute top-1 right-1"></div>
              <div className="w-2.5 h-0.5 bg-red-600/60 rounded absolute bottom-1"></div>
            </div>
            {/* Robot Neck */}
            <div className="w-2 h-1 bg-slate-400"></div>
            {/* Body */}
            <div className="w-9 h-10 rounded bg-indigo-500/70 border border-indigo-400 shadow-lg flex items-center justify-center">
              <div className="text-[7px] font-mono text-indigo-200 font-bold">DUMMY</div>
            </div>
          </div>

          {/* Actual Rendered Crosshair Over the Sandbox */}
          <div className="absolute pointer-events-none flex items-center justify-center">
            {/* Dot center if enabled */}
            {settings.dot && (
              <div
                style={{
                  width: `${settings.thickness}px`,
                  height: `${settings.thickness}px`,
                  backgroundColor: settings.color,
                  boxShadow: settings.outline ? `0 0 0 1px ${settings.outlineColor}` : 'none',
                }}
                className="absolute rounded-full"
              />
            )}

            {/* Top arm */}
            <div
              style={{
                width: `${settings.thickness}px`,
                height: `${settings.size}px`,
                backgroundColor: settings.color,
                transform: `translateY(-${settings.gap + settings.size / 2}px)`,
                boxShadow: settings.outline ? `0 0 0 1px ${settings.outlineColor}` : 'none',
              }}
              className="absolute transition-transform duration-100"
            />

            {/* Bottom arm */}
            <div
              style={{
                width: `${settings.thickness}px`,
                height: `${settings.size}px`,
                backgroundColor: settings.color,
                transform: `translateY(${settings.gap + settings.size / 2}px)`,
                boxShadow: settings.outline ? `0 0 0 1px ${settings.outlineColor}` : 'none',
              }}
              className="absolute transition-transform duration-100"
            />

            {/* Left arm */}
            <div
              style={{
                width: `${settings.size}px`,
                height: `${settings.thickness}px`,
                backgroundColor: settings.color,
                transform: `translateX(-${settings.gap + settings.size / 2}px)`,
                boxShadow: settings.outline ? `0 0 0 1px ${settings.outlineColor}` : 'none',
              }}
              className="absolute transition-transform duration-100"
            />

            {/* Right arm */}
            <div
              style={{
                width: `${settings.size}px`,
                height: `${settings.thickness}px`,
                backgroundColor: settings.color,
                transform: `translateX(${settings.gap + settings.size / 2}px)`,
                boxShadow: settings.outline ? `0 0 0 1px ${settings.outlineColor}` : 'none',
              }}
              className="absolute transition-transform duration-100"
            />
          </div>
        </div>

        <p className="text-[10px] text-slate-500 font-medium text-center px-4">
          인게임에서 WASD 이동을 하거나 무기를 사격해 보며 실시간 반동 벡터에 맞춰 크로스헤어가 역동적으로 퍼지는 효과를 관찰해 보세요.
        </p>
      </div>
    </div>
  );
};
