export default function HeatmapRegionChips({ regions }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#071116]/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
      <h2 className="text-2xl font-bold tracking-[-.03em] text-white">Heatmap Decision Areas</h2>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {regions.map((region) => (
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-4 py-2 text-sm font-bold text-cyan-100" key={region}>{region}</span>
        ))}
      </div>
      <p className="mt-5 max-w-[820px] text-[15px] leading-7 text-[#a9bac1]">
        Grad-CAM heatmaps show the regions that influenced the model decision. Stronger highlighted areas indicate higher impact on the final Fake or Real prediction.
      </p>
    </section>
  )
}
