export interface Poem {
  id: string;
  title: string;
  titleColor: string;
  backgroundColor: string;
  textColor: string;
  content: string;
}

export const poems: Poem[] = [
  {
    id: "atlantic-pacific",
    title: "atlantic\n            pacific",
    titleColor: "#2A3B4E", // moonlit-ocean
    backgroundColor: "#F8FAFB",
    textColor: "#040507",
    content: `i often wake three hours before
your sunrise calls for a response
logbook already soaked with ink
we laugh, but even if we could,
<em>why constrain our outporings?</em>

one winter day you ask for
notes on undersea strings
aware of both the timbre
and tempo of these songs
we start signing together

i fall into an evening rhythm
talking and yes moaning into
the phonograph, my head then
swallowed by the brassy cone
our voices sound better inside

when you open your ears again
there's so much weather to hear :
wind and rain and quiet calm that
lasts too long and means too much
we keep sailing even without a map

true, land divides us more than sea,
but these two coasts call to us both
maybe it's the sirens or the sounds 
of wavecrash against the shore —
the dangers of unfathomed depths`
  },
  {
    id: "accidentily",
    title: "accident(ily)",
    titleColor: "#B60017", // candy-apple-red
    backgroundColor: "#FFF5F6",
    textColor: "#0A0001",
    content: `one fifty-four
is not the hour
to send texts,
no autocorrect

risky confessions
clipped affections
dimmed i love you's
from neon rooms

could be a typo
should i just lol
or say her name,
reply the same?
            
an oops can't erase
the thrumming bass
as juniper slips
from her bruised lips

tripping on her tongue
<em>fuck. uhh. drunk. umm.</em>
not that
not yet

or at least —
not like this`
  }
]; 