// app/page.js
import dynamic from 'next/dynamic'

const RosterGenerator = dynamic(() => import('../components/RosterGenerator'), {
  ssr: false
})

export default function Home() {
  return <RosterGenerator />
}
