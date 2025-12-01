// src/app/posts/walrus/page.tsx
"use client";
import { useState } from "react";
import ModeSwitcher, { type Mode } from "../components/ModeSwitcher";
import PostShell from "../components/PostShell";
import Footnote from "../components/Footnote";

export default function WalrusPage() 
{
  const [mode, setMode] = useState<Mode>("standard");
  const vis: boolean = mode !== "standard";

  return (
    <PostShell title="When I Am The Walrus" subtitle="November 2025" visible={false}>
      <ModeSwitcher mode={mode} setMode={setMode} />

      <p>
				I have taken “all things in moderation, even moderation” too far. Knowing neither temperance nor inertia and swinging violently 
				back across the mental-physical divide, I swing and not run because my shins have joined their brother arms in strike. 
				Stop using us, they sneer. For their indolence my mind is now eating itself. You see, without Safari—but still with iPhone—it’s 
				Photos, Notes, and Drive that capture restlessness. Before you know it you’re doom editing papers (everyone cheers?) about yourself 
				(everyone winces); yes, letters more than papers spent on figuring out and also performing formal fears can estrange us from the content. 
				Is Ryan the freeway or the morphology? Ridiculous question: he is interested in law, linguistics, and 
				tech—obviously, he’s the tension itself!
			</p>
			<p>
				It seems sometimes that I am being suffocated by everything I have ever heard, read, and wrote. 
				It seems that I am seeking a metaphor,<Footnote index={1} vis={vis}><i>Med.</i>, 19.</Footnote> 
				seems that I live as I dream,<Footnote index={2} vis={vis}>Conrad, <i>Heart of Darkness</i>.</Footnote> 
				seems I am clawing, gasping, and barely breaching<Footnote index={3} vis={vis}><i>Dev.</i>, 22.</Footnote> 
				three things in this speech,<Footnote index={4} vis={vis}>WUDC 2025, Sydney C.</Footnote> 
				two reasons why,<Footnote index={5} vis={vis}>"Writing about Oneself."</Footnote> 
				or to become one?<Footnote index={6} vis={vis}><i>Dev.</i>, 1.</Footnote> 
				No, scaring from the dead rat’s five more,<Footnote index={7} vis={vis}>AM.</Footnote> 
				the V4,<Footnote index={8} vis={vis}>Ascent, "The Impaler."</Footnote> 
				the face you keep in a jar by the door, who is this for?<Footnote index={9} vis={vis}>The Beatles, "Eleanor Rigby."</Footnote> 
				All the hermetic logic,<Footnote index={10} vis={vis}>DZ.</Footnote> 
				where does it all belong? Probably not Here, There and Every—wait.<Footnote index={11} vis={vis}>The Beatles, "—where."</Footnote>  
				Let’s try that. Okay… I really want to stop the show, because I think you might like to know, yes! 
				That the writer’s gonna right a wrong, and I want you all to read along, wow. 
				So let me introduce to you the one and only—who the fuck is Billy Shears?
				<Footnote index={12} vis={vis}>The Beatles, "Sgt. Pepper's Lonely Hearts Club Band."</Footnote> 
			</p>
			<p>
				November was. I befell a short number of poor decisions that had an outsized impact on my general welfare. 
				I was also felled in the short by a number of reasonable decisions  I think will prove net positive to come. 
				Finally, I discovered more that I want to change. I am here to address few of these in no particular order 
				for both myself and any of you curious. 
			</p>
			<p style={{ textIndent: "2em" }}>
				<i>1. What is the aesthetic?</i>
			</p>
			<p>
				I suggested to Professor Fadiman that mine adores play. I then performed enough counts of strained grammar, wrong words, 
				hostile references, and felony modernism to be denied prescriptionist bail. I appealed to Judge Vilhelm that it was all 
				transparently opaque enough. His Honor instructed me to alert everyone that he is the author of <i>Either/Or</i>’s ethical half. 
				I obliged and then complained that a reference loses for its explanation. He asked me to explain the difference between a reference and a fraud. 
				I charged him. 
			</p>
			<p>
				What I propose is writing as curation. Try it. Clip a ransom note from your life. 
				Think deep. What can you scrounge up? Take an inventory. Who are you right now? I’m guessing <i>Revolver</i> is not on tap, so what is? 
				Which of your friend’s messages still jostles around your head? Now own them: as much as you can improve, cultivate, and use the product of, 
				as much is yours.<Footnote index={13} vis={vis}>Locke, <i>Second Treatise</i>.</Footnote> 
				Look what there is to gain! You parse all that is legible of late and the memories hydrate in quick succession, 
				you employ all that’s been deployed and your conditions spill reclaimed from every phrase, 
				you are composing—not merely stringing that web of associations—you are building with the mortar of your intellect a towering self. 
			</p>
			<p>
				If you ask who is steering this ship, you ask right whether such a totalizing intertextuality doesn’t efface some essence, 
				doesn’t disintegrate some vocal muscle that no multiple of 42<Footnote index={14} vis={vis}>Fairlife.</Footnote> can save. 
				You point out that such deafening displays of allusion might hamstring the non-associative, 
				foreclose novelty, even inspire LLM-type spirals into muddled on muddled on nothing. 
				I shrug. I ask for a word that hasn’t been used. 
				I point to Apollo.<Footnote index={15} vis={vis}><i>Star Trek</i>, "Who Mourns for Adonais?"</Footnote> 
				I point to Alexander.<Footnote index={16} vis={vis}><i>Star Trek</i>, "Plato's Stepchildren."</Footnote> 
				I extend my hand into a sharp metal spear<Footnote index={17} vis={vis}>Cameron, <i>Terminator II.</i></Footnote> 
				and condemn you to the flute.<Footnote index={18} vis={vis}>Kurosawa, <i>Ran.</i></Footnote> 
				I throw a handkerchief at you<Footnote index={19} vis={vis}>Shakespeare, <i>Othello</i>.</Footnote> 
				and ask whether you’ll fight back.<Footnote index={20} vis={vis}><i>Cheers</i>, "I Iove it! A Desdemona that fights back!"</Footnote> 
				I sob as I bury my head in your neck as our hearts convulse in rhythm as.
			</p>
			<p style={{ textIndent: "2em" }}>
				<i>2. What will be friction?</i>
			</p>
			<p>
				Sophie sang “Losing My Religion” for one minute and fifty seconds.<Footnote index={21} vis={vis}>Wells, <i>Aftersun</i>.</Footnote> 
				Sophie I cannot understand. 
				Can you weep over her? 
				She was not pressured into a five-part “At The Copa.”<Footnote index={22} vis={vis}>DG.</Footnote> 
				She was not doused in vodka for holding the 40-second E.<Footnote index={23} vis={vis}>The Beatles, "A Day in the Life."</Footnote> 
				When I think of Sophie, 
				I am as though annihilated, as though paralyzed.<Footnote index={24} vis={vis}>Kierkegaard, <i>Fear and Trembling</i>.</Footnote>
				I fall down—I am brought to my knees by the millions of bits that cry out in terror and are suddenly silenced. 
				How do you not cry out! The spotlights her on fire, and we are breathing in, aren’t we all choking on the smoke? 
				Not a drill nor a dream, Sophie cannot lose her religion: she is one. 
			</p>
			<p>
				Heavy is my head that voices desire.<Footnote index={25} vis={vis}>Agadmator on Esipenko over Carlsen at Tata Steel 2021.</Footnote>  
				Uneasy should be any that hears the hitch.<Footnote index={26} vis={vis}>Shakespeare, <i>Henry IV</i>.</Footnote>  
				Our fabric is so light, so thinly strung that every assertion risks slicing us through a space’s time. 
				Hooray that our swift faculties can calculate every line, that we can arm ourselves with deniabilities and hold the balance in a language of feints. 
				Fear no misunderstanding: the evaluation bar does not struggle with subjunctives. 
				Impalpable initiatives still hallow immortal squares—we merely paint with brushes dipped in the whispering currents, 
				of unborn sequences and unknown sacrifice. Don’t we always speak with possibilities? 
				So few moves will be played, how could we be poorer for thinking every turn? Do we even need the end? 
				Oh, Sophie, the end! We are safer here in machination. Can you really bear the toppled crown? 
				See tearlessly him that couldn’t see far enough? 
				If you do not shudder at Qe2,<Footnote index={27} vis={vis}>World Chess Championship 2023, Final Tiebreak.</Footnote>  
				if Rg6 does not drench you in—does not make you tread nausea, you do not know me. 
			</p>
			<p>
				We both know it is better to speak.<Footnote index={28} vis={vis}>Guadagnino.</Footnote> 
				I know it is better to join you on the shore than the sea. 
				Where in pale blue and a hint of pink the sun dresses the coast. Where glimmers pool as rocks trap the tide and basketballs arc in a budding dusk. 
				I ask if you have any water. <i>Sorry, I mean I want water.</i> A band strums to the waves nearby. 
				<i>Will you be going tomorrow?</i> Jesus, no, I say I want to go with you. Their rhythm rises in the purple twilight, and my feet begin to tap. Fuck, no, those were mistakes! 
				I didn’t hear you—what song? Please, I know I ordered the peppermint mocha, but he knew it, too. I asked for coffee, and I woke up to climb, please. 
				A car door slams. The sands don’t feel his steps. He produces a bass guitar. 
				Weber has arrived to make me dance until I die.<Footnote index={29} vis={vis}>DZ: "Weber would make you dance and study you."</Footnote> 
				I will speak anyway. I promise that my flesh will draw apart an abstract standing. 
				A new splatter of fortitude, this, a praying face to the sea.<Footnote index={30} vis={vis}><i>Redwoods</i>.</Footnote> 
			</p>
			<p style={{ textIndent: "2em" }}>
				<i>3. What was optimization?</i>
			</p>
			<p>
				For the worse part of a year I made u-turns. It did not matter the route, 
				not whether I was picking up a friend from the airport or sharing music with the suburbs. 
				At any moment a lurch could restore my attention. A pothole? Likely. But could I rule out a cyclist? 
				My share in a felony hit and run? Always choosing—between the options of keeping driving 
				and risking four years in state prison or, for the cost of a mile, 
				merging into the left lane—the latter, I'd drive through the scene again completely alert, 
				music turned off and windows rolled down, sensitive to any texture of the road, rumble of the car, or 
				corpse strewn across the curb. Every time I was completely satisfied that I hadn’t murdered a cyclist on my first pass. 
				But what if I had on the second?
			</p>
			<p>
				If you make enough u-turns, you make no progress. 
				If a new cyclist falls on your way to dissipate another, 
				you begin an ugly type of recursion where the loops tighten around a single point. 
				At it, your car is parked as every sense in your possession aims desperately at the road. 
				No matter its width, repair, or silence, you are unsure. Your perception has lost. 
				It has been eclipsed by reason, a sick reason, an ill rationality shouting over 
				the world while flailing between an analysis of which days cyclists ride 
				the most and whether a bike actually could be crumpled by a Prius driving four miles an hour, 
				and if so, what that would sound like. Here, your rearview replaces your dashboard and 
				objects are too close to be objects. You are motionless in this world.
			</p>
			<p>
				Last week I bought climbing shoes without Safari. I ached, rest assured, for quantity’s 
				authorization of quality and objectivity’s patting the head of my easily confused and 
				assuredly deceived subjectivity. In steads, I let myself to the mercy of too-long-forgotten and delightfully 
				pecuilar sociality. Hello, friend with carabiner! Are you familiar with the Helix? Go down a size, you say? 
				If I were Achilles, I would already be dead! It was a short fight in the swells of contingency, but one quite 
				exciting and already in advance demanding of continued sensation, lest, for instance, my Scarpa’s fail sufficiently 
				for a return. I once argued that we are only conscious while we calculate, that there is fathomable no existence 
				illegible to monologue. I had found in the modernists a trap to be escaped, but perhaps they shared with us a way to live. 
			</p>
			<p>
				For December, I plan to reach differently. 
				Equipped with new lows of information access and a taste for sensory risk, I mean to abandon the self to a new being and hopefully others, too. 
				I hope to think less. I hope to affect and be affected. And I look forward to seeing the wake. 
			</p>
    </PostShell>
  );
}
