import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell InnoCooks what's slowing your business down. We reply within 24 hours with how we'd approach it.",
};

export default function ContactPage() {
  return (
    <>
    <section className="bg-onyx pt-24">
      <div className="container-x grid grid-cols-1 gap-14 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="label-mono">[ START_A_PROJECT ]</p>
          <h1 className="display h-xl mt-6 text-white">
            Tell us what you&apos;re trying to <em className="em">build</em>.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-ash">
            A website, an internal system, an AI workflow, or just a problem you can&apos;t
            name yet. Describe it in your own words; we&apos;ll reply within 24 hours with
            how we&apos;d approach it.
          </p>

          <ul className="mt-12 flex flex-col gap-4">
            <li>
              <a
                href="mailto:vishnuuu24@gmail.com"
                className="font-mono text-sm uppercase tracking-[0.14em] text-white transition-none hover:text-kinetic"
              >
                → vishnuuu24@gmail.com
              </a>
            </li>
            <li className="label-mono label-mono--ash">Based in India · working everywhere</li>
            <li className="label-mono label-mono--ash">Reply within 24 hours</li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
    <Footer />
    </>
  );
}
