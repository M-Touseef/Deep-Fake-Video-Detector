import { useEffect, useRef } from 'react'
import { FaFilePdf } from 'react-icons/fa'
import {
  SiAxios,
  SiDocker,
  SiExpress,
  SiFlask,
  SiFramer,
  SiJavascript,
  SiJsonwebtokens,
  SiMediapipe,
  SiMongodb,
  SiMongoose,
  SiNodedotjs,
  SiNumpy,
  SiOpencv,
  SiPython,
  SiPytorch,
  SiReact,
  SiRender,
  SiSwiper,
  SiTailwindcss,
  SiVercel,
  SiVite,
} from 'react-icons/si'
import { motion, useAnimation, useInView } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

const skills = [
  { name: 'JavaScript', icon: <SiJavascript className="text-[#F7DF1E]" size={34} /> },
  { name: 'React.js', icon: <SiReact className="text-[#61DAFB]" size={34} /> },
  { name: 'Vite', icon: <SiVite className="text-[#646CFF]" size={34} /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss className="text-[#06B6D4]" size={34} /> },
  { name: 'Framer Motion', icon: <SiFramer className="text-white" size={34} /> },
  { name: 'Swiper', icon: <SiSwiper className="text-[#6332F6]" size={34} /> },
  { name: 'Node.js', icon: <SiNodedotjs className="text-[#5FA04E]" size={34} /> },
  { name: 'Express.js', icon: <SiExpress className="text-slate-100" size={34} /> },
  { name: 'MongoDB', icon: <SiMongodb className="text-[#47A248]" size={34} /> },
  { name: 'Mongoose', icon: <SiMongoose className="text-[#880000]" size={34} /> },
  { name: 'JWT Auth', icon: <SiJsonwebtokens className="text-[#D63AFF]" size={34} /> },
  { name: 'Axios', icon: <SiAxios className="text-[#5A29E4]" size={34} /> },
  { name: 'Python', icon: <SiPython className="text-[#3776AB]" size={34} /> },
  { name: 'Flask', icon: <SiFlask className="text-slate-100" size={34} /> },
  { name: 'PyTorch', icon: <SiPytorch className="text-[#EE4C2C]" size={34} /> },
  { name: 'OpenCV', icon: <SiOpencv className="text-[#5C3EE8]" size={34} /> },
  { name: 'MediaPipe', icon: <SiMediapipe className="text-[#0097A7]" size={34} /> },
  { name: 'NumPy', icon: <SiNumpy className="text-[#013243]" size={34} /> },
  { name: 'Grad-CAM', icon: <SiPytorch className="text-[#EE4C2C]" size={34} /> },
  { name: 'PDF Reports', icon: <FaFilePdf className="text-[#FF4B4B]" size={34} /> },
  { name: 'Docker', icon: <SiDocker className="text-[#2496ED]" size={34} /> },
  { name: 'Render', icon: <SiRender className="text-slate-100" size={34} /> },
  { name: 'Vercel', icon: <SiVercel className="text-slate-100" size={34} /> },
]

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function TechnologyShowcase() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [controls, isInView])

  return (
    <section
      id="technology"
      ref={ref}
      className="relative w-full overflow-hidden border-t border-white/[.055] bg-gradient-to-b from-[#050b0f] via-[#071218] to-[#05090c] px-4 py-24 transition-colors duration-300 sm:px-6"
      aria-labelledby="technology-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(33,216,238,.13),transparent_36%)]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div className="mb-16 text-center" initial="hidden" animate={controls} variants={variants}>
          <motion.div className="mb-5 flex items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-cyan-200/80" variants={itemVariants}>
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
            Technology stack
          </motion.div>
          <motion.h2 id="technology-title" className="mb-4 text-4xl font-bold leading-tight sm:text-5xl" variants={itemVariants}>
            <span className="text-white">Technical </span>
            <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">
              Expertise
            </span>
          </motion.h2>
        </motion.div>

        <motion.div className="hidden md:block" initial="hidden" animate={controls} variants={variants}>
          <Swiper
            effect="coverflow"
            grabCursor
            centeredSlides
            loop
            slideToClickedSlide
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            modules={[EffectCoverflow, Autoplay]}
            className="pb-16"
          >
            {skills.map((skill) => (
              <SwiperSlide key={skill.name} className="!h-[200px] !w-[200px]">
                <motion.div
                  className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/[.08] bg-[#0b1a21]/90 p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,.32)] transition-all duration-300 hover:border-cyan-300/35 hover:shadow-[0_28px_80px_rgba(0,0,0,.38),0_0_36px_rgba(33,216,238,.12)]"
                  whileHover={{ y: -10, scale: 1.05 }}
                  variants={itemVariants}
                >
                  <div className="mb-4 grid size-16 place-items-center rounded-2xl border border-cyan-200/10 bg-white/[.035]">
                    {skill.icon}
                  </div>
                  <p className="text-lg font-semibold text-slate-100">{skill.name}</p>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <motion.div className="md:hidden" initial="hidden" animate={controls} variants={variants}>
          <Swiper
            slidesPerView={3}
            spaceBetween={20}
            loop
            slideToClickedSlide
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="pb-10"
          >
            {skills.map((skill) => (
              <SwiperSlide key={skill.name} className="!h-[120px]">
                <motion.div
                  className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-white/[.08] bg-[#0b1a21]/90 p-3 text-center shadow-[0_16px_45px_rgba(0,0,0,.28)] transition-all duration-300 hover:border-cyan-300/35"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                >
                  <div className="mb-2 grid size-11 place-items-center rounded-xl border border-cyan-200/10 bg-white/[.035]">
                    {skill.icon}
                  </div>
                  <p className="text-sm font-medium leading-tight text-slate-100">{skill.name}</p>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}
