import Navbar from './Navbar'
import Hero from './Hero'
import Features from './Features'

export default function LandingPage({ onOpen}) {

    return (
        
        <div>
            <Navbar onOpen={onOpen} />
            <Hero onOpen={onOpen} />
            <Features />
            <footer className="px-6 py-7 text-center text-[.85rem] text-slate-600">
                © 2026 Hope, Inc. ERP System . All rights reserved.
                </footer>
        </div>
    )
} 
