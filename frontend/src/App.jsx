import { useEffect, useRef, useState } from "react";
import "./App.css";
import ExplanationPanel from "./components/ui/ExplanationPanel";
import QuizPanel from "./components/ui/QuizPanel";
import FlashcardsPanel from "./components/ui/FlashcardsPanel";
import PomodoroPanel from "./components/ui/PomodoroPanel";
import WeakAreasPanel from "./components/ui/WeakAreasPanel";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "D" },
  { id: "explain", label: "Explain", icon: "E" },
  { id: "quiz", label: "Quiz", icon: "Q" },
  { id: "flashcards", label: "Flashcards", icon: "F" },
  { id: "pomodoro", label: "Pomodoro", icon: "P" },
  { id: "weakareas", label: "Weak Areas", icon: "W" },
  { id: "saved", label: "Saved", icon: "S" },
];

const DEFAULT_USER = { name: "Prerana", email: "prerana@example.com", provider: "Google" };
const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL || "http://localhost:5000/auth/google";
const SPOTIFY_AUTH_URL = import.meta.env.VITE_SPOTIFY_AUTH_URL || "";

function formatStudyTime(s) { return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`; }
function formatTabTimer(totalSeconds) { return `${String(Math.floor(totalSeconds/60)).padStart(2,"0")}:${String(totalSeconds%60).padStart(2,"0")}`; }
function formatHistoryDate(iso) { return new Date(iso).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}); }
function formatCalendarLabel(dateKey) { return new Date(dateKey).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
function toDateKey(d) { const date=new Date(d); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function cleanMaterialText(t) { return t.replace(/\s+/g," ").trim(); }
function splitMaterialSentences(t) { return cleanMaterialText(t).split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>35); }
function buildFlashcardsFromText(text) {
  return splitMaterialSentences(text).slice(0,8).map((sentence,i)=>{
    const words=sentence.replace(/[^a-zA-Z0-9\s-]/g,"").split(" ").filter(Boolean);
    return {id:i+1,term:words.slice(0,Math.min(4,words.length)).join(" "),definition:sentence};
  });
}
function buildQuizFromText(text) {
  const sentences=splitMaterialSentences(text).slice(0,5);
  if(!sentences.length) return [];
  return sentences.map((sentence,i)=>{
    const short=sentences.map(s=>s.length>70?s.slice(0,67)+"...":s);
    const distractors=short.filter((_,j)=>j!==i).slice(0,3);
    while(distractors.length<3) distractors.push(`Not mentioned in uploaded notes ${distractors.length+1}`);
    return {id:i+1,question:"Which statement appears in your uploaded notes?",options:[short[i],...distractors],correct:0};
  });
}

function MiniPomodoro({ onStudyTick }) {
  const [timeLeft,setTimeLeft]=useState(25*60);
  const [running,setRunning]=useState(false);
  const [sessions,setSessions]=useState(0);
  const ref=useRef(null);
  const total=25*60;
  const mins=String(Math.floor(timeLeft/60)).padStart(2,"0");
  const secs=String(timeLeft%60).padStart(2,"0");
  useEffect(()=>{
    if(running){
      ref.current=setInterval(()=>{
        setTimeLeft(t=>{
          if(t<=1){clearInterval(ref.current);setRunning(false);setSessions(s=>s+1);return 0;}
          onStudyTick?.(); return t-1;
        });
      },1000);
    } else clearInterval(ref.current);
    return ()=>clearInterval(ref.current);
  },[running,onStudyTick]);
  return (
    <div className="mini-pom">
      <p className="mini-pom-label">⏱ Focus Timer</p>
      <div className="mini-pom-time">{mins}:{secs}</div>
      {sessions>0&&<p style={{textAlign:"center",fontSize:"0.72rem",color:"var(--teal)",marginBottom:"8px"}}>🍅 {sessions} session{sessions>1?"s":""} done</p>}
      <div style={{display:"flex",gap:"8px"}}>
        <button className="btn-primary" style={{flex:1,padding:"8px 0",fontSize:"0.75rem"}} onClick={()=>setRunning(r=>!r)}>
          {running?"Pause":timeLeft===total?"Start":"Resume"}
        </button>
        <button className="btn-ghost" style={{flex:1,padding:"8px 0",fontSize:"0.75rem"}} onClick={()=>{setTimeLeft(total);setRunning(false);}}>Reset</button>
      </div>
    </div>
  );
}

function ChecklistPanel({tasks,taskInput,onTaskInputChange,onTaskAdd,onTaskToggle,onTaskDelete}) {
  const done=tasks.filter(t=>t.done).length;
  return (
    <div className="checklist-wrap">
      <div className="checklist-head">
        <div>
          <p className="checklist-title">Checklist</p>
          <p className="checklist-count">{done}/{tasks.length} done</p>
        </div>
        <span className="tag tag-teal">Tasks</span>
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
        <input className="task-input" placeholder="Add a task..." value={taskInput}
          onChange={e=>onTaskInputChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onTaskAdd()}/>
        <button className="btn-primary" style={{padding:"8px 14px",fontSize:"0.75rem",flexShrink:0}} onClick={onTaskAdd}>Add</button>
      </div>
      <div className="checklist-list">
        {tasks.length>0?tasks.map(task=>(
          <div key={task.id} className="task-item">
            <button onClick={()=>onTaskToggle(task.id)} style={{width:"18px",height:"18px",borderRadius:"5px",flexShrink:0,border:"1px solid",borderColor:task.done?"var(--teal)":"var(--border-2)",background:task.done?"var(--teal)":"transparent",color:task.done?"var(--bg)":"transparent",fontSize:"10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button>
            <p style={{flex:1,fontSize:"0.78rem",color:task.done?"var(--text-3)":"var(--text-2)",textDecoration:task.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.text}</p>
            <button onClick={()=>onTaskDelete(task.id)} style={{background:"none",border:"none",color:"var(--rose)",fontSize:"0.7rem",cursor:"pointer",flexShrink:0}}>✕</button>
          </div>
        )):<p style={{fontSize:"0.75rem",color:"var(--text-3)",padding:"8px 0"}}>No tasks yet. Add study goals here.</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [activeNav,setActiveNav]=useState("dashboard");
  const [searchInput,setSearchInput]=useState("");
  const [topic,setTopic]=useState("");
  const [topicRequestKey,setTopicRequestKey]=useState(0);
  const [submitted,setSubmitted]=useState(false);
  const [weakAreas,setWeakAreas]=useState([]);
  const [studySeconds,setStudySeconds]=useState(()=>Number(localStorage.getItem("studybuddy-study-seconds")||0));
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [authMode,setAuthMode]=useState(null);
  const [profileMenuOpen,setProfileMenuOpen]=useState(false);
  const [currentUser,setCurrentUser]=useState(()=>{const s=localStorage.getItem("studybuddy-user");return s?JSON.parse(s):null;});
  const [studyHistory,setStudyHistory]=useState(()=>{const s=localStorage.getItem("studybuddy-history");return s?JSON.parse(s):[];});
  const [stickyNoteInput,setStickyNoteInput]=useState("");
  const [stickyNotes,setStickyNotes]=useState(()=>{const s=localStorage.getItem("studybuddy-sticky-notes");return s?JSON.parse(s):[];});
  const [pastedNotes,setPastedNotes]=useState("");
  const [uploadedSources,setUploadedSources]=useState(()=>{const s=localStorage.getItem("studybuddy-sources");return s?JSON.parse(s):[];});
  const [calendarViewDate,setCalendarViewDate]=useState(()=>{const t=new Date();return new Date(t.getFullYear(),t.getMonth(),1);});
  const [selectedCalendarDate,setSelectedCalendarDate]=useState(()=>toDateKey(new Date()));
  const [calendarTabOpen,setCalendarTabOpen]=useState(false);
  const [calendarEventInput,setCalendarEventInput]=useState("");
  const [calendarEvents,setCalendarEvents]=useState(()=>{const s=localStorage.getItem("studybuddy-calendar-events");return s?JSON.parse(s):{};});
  const [taskInput,setTaskInput]=useState("");
  const [tasks,setTasks]=useState(()=>{const s=localStorage.getItem("studybuddy-tasks");return s?JSON.parse(s):[];});
  const [dashFocus,setDashFocus]=useState("explain");
  const [spotifyConnected,setSpotifyConnected]=useState(()=>localStorage.getItem("studybuddy-spotify-connected")==="true");
  const [spotifyTrack,setSpotifyTrack]=useState(()=>{const s=localStorage.getItem("studybuddy-spotify-track");return s?JSON.parse(s):null;});
  const [darkMode,setDarkMode]=useState(()=>localStorage.getItem("studybuddy-theme")==="dark");
  const [pomodoroStatus,setPomodoroStatus]=useState({ running: false, timeLeft: 25 * 60 } );
  const [savedTopics,setSavedTopics]=useState(()=>{const s=localStorage.getItem("studybuddy-saved-topics");return s?JSON.parse(s):[];});
  const profileMenuRef=useRef(null);
  const userName=currentUser?.name??"Guest";

  useEffect(()=>{localStorage.setItem("studybuddy-study-seconds",String(studySeconds));},[studySeconds]);
  useEffect(()=>{if(currentUser)localStorage.setItem("studybuddy-user",JSON.stringify(currentUser));else localStorage.removeItem("studybuddy-user");},[currentUser]);
  useEffect(()=>{localStorage.setItem("studybuddy-history",JSON.stringify(studyHistory));},[studyHistory]);
  useEffect(()=>{localStorage.setItem("studybuddy-sticky-notes",JSON.stringify(stickyNotes));},[stickyNotes]);
  useEffect(()=>{localStorage.setItem("studybuddy-sources",JSON.stringify(uploadedSources));},[uploadedSources]);
  useEffect(()=>{localStorage.setItem("studybuddy-calendar-events",JSON.stringify(calendarEvents));},[calendarEvents]);
  useEffect(()=>{localStorage.setItem("studybuddy-tasks",JSON.stringify(tasks));},[tasks]);
  useEffect(()=>{localStorage.setItem("studybuddy-spotify-connected",spotifyConnected?"true":"false");},[spotifyConnected]);
  useEffect(()=>{localStorage.setItem("studybuddy-spotify-track",JSON.stringify(spotifyTrack));},[spotifyTrack]);
  useEffect(()=>{localStorage.setItem("studybuddy-theme",darkMode?"dark":"light");},[darkMode] );
  useEffect(()=>{localStorage.setItem("studybuddy-saved-topics",JSON.stringify(savedTopics));},[savedTopics]);
  useEffect(()=>{
    document.title = pomodoroStatus.running ? `${formatTabTimer(pomodoroStatus.timeLeft)} | studybuddy` : "studybuddy";
    return ()=>{ document.title = "studybuddy"; };
  },[pomodoroStatus]);

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    const name=p.get("name"),email=p.get("email"),provider=p.get("provider");
    if(name&&email){setCurrentUser({name,email,provider:provider||"Google"});setAuthMode(null);window.history.replaceState({},"",window.location.pathname);}
  },[]);

  useEffect(()=>{
    const fn=e=>{if(profileMenuRef.current&&!profileMenuRef.current.contains(e.target))setProfileMenuOpen(false);};
    document.addEventListener("mousedown",fn);return()=>document.removeEventListener("mousedown",fn);
  },[]);

  const handleTopicSubmit=()=>{
    const t=searchInput.trim();
    if(!t)return;
    setTopic(t);
    setSearchInput(t);
    setTopicRequestKey(k=>k+1);
    setSubmitted(true);
    setStudyHistory(prev=>[{id:`${Date.now()}-${t}`,topic:t,searchedAt:new Date().toISOString()},...prev]);
  };
  const handleWeakAreas=areas=>setWeakAreas(prev=>[...new Set([...prev,...areas])]);
  const handleStudyTick=()=>setStudySeconds(p=>p+1);
  const handleStartFreshTopic=()=>{setSearchInput("");setTopic("");setSubmitted(false);setWeakAreas([]);setTopicRequestKey(k=>k+1);setActiveNav("dashboard" );};
  const handleSaveCurrentTopic=()=>{const currentTopic=topic.trim();if(!currentTopic)return;setSavedTopics(prev=>[{id:`${Date.now()}-${currentTopic}`,topic:currentTopic,savedAt:new Date().toISOString(),weakAreas:[...weakAreas]},...prev.filter(item=>item.topic.toLowerCase()!==currentTopic.toLowerCase())]);handleStartFreshTopic( );};
  const handleResumeSavedTopic=item=>{setTopic(item.topic);setSearchInput(item.topic);setSubmitted(true);setWeakAreas(item.weakAreas||[]);setTopicRequestKey(k=>k+1);setActiveNav("dashboard" );};
  const handleDeleteSavedTopic=id=>setSavedTopics(prev=>prev.filter(item=>item.id!==id));
  const handleTaskAdd=()=>{const t=taskInput.trim();if(!t)return;setTasks(p=>[{id:`${Date.now()}-${t}`,text:t,done:false},...p]);setTaskInput("");};
  const handleTaskToggle=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const handleTaskDelete=id=>setTasks(p=>p.filter(t=>t.id!==id));
  const handleStickyNoteAdd=()=>{const t=stickyNoteInput.trim();if(!t)return;setStickyNotes(p=>[{id:`${Date.now()}-${t}`,text:t},...p]);setStickyNoteInput("");};
  const handleStickyNoteDelete=id=>setStickyNotes(p=>p.filter(n=>n.id!==id));
  const handleSavePastedNotes=()=>{const t=cleanMaterialText(pastedNotes);if(!t)return;setUploadedSources(p=>[{id:`${Date.now()}-pasted`,name:`Pasted notes ${p.length+1}`,kind:"text",text:t,uploadedAt:new Date().toISOString()},...p]);setPastedNotes("");};
  const handleSourceFilesSelected=async e=>{
    const files=Array.from(e.target.files||[]);
    const processed=await Promise.all(files.map(file=>new Promise(resolve=>{
      if(file.name.toLowerCase().endsWith(".pdf")){resolve({id:`${Date.now()}-${file.name}`,name:file.name,kind:"pdf",text:"",uploadedAt:new Date().toISOString()});return;}
      const r=new FileReader();
      r.onload=()=>resolve({id:`${Date.now()}-${file.name}`,name:file.name,kind:"text",text:cleanMaterialText(String(r.result||"")),uploadedAt:new Date().toISOString()});
      r.onerror=()=>resolve({id:`${Date.now()}-${file.name}`,name:file.name,kind:"text",text:"",uploadedAt:new Date().toISOString()});
      r.readAsText(file);
    })));
    setUploadedSources(p=>[...processed.filter(Boolean),...p]);
    e.target.value="";
  };
  const handleCalendarEventAdd=()=>{const t=calendarEventInput.trim();if(!t||!selectedCalendarDate)return;setCalendarEvents(p=>({...p,[selectedCalendarDate]:[...(p[selectedCalendarDate]||[]),{id:`${Date.now()}-${t}`,text:t}]}));setCalendarEventInput("");};
  const handleCalendarEventDelete=(dateKey,eventId)=>{setCalendarEvents(p=>{const updated=(p[dateKey]||[]).filter(ev=>ev.id!==eventId);const next={...p};if(updated.length>0)next[dateKey]=updated;else delete next[dateKey];return next;});};
  const handleLogout=()=>{setProfileMenuOpen(false);setCurrentUser(null);setAuthMode(null);setActiveNav("dashboard");};
  const handleDeleteAccount=()=>{
    if(!window.confirm("Delete account and clear all local data?"))return;
    setCurrentUser(null);setStudyHistory([]);setStudySeconds(0);setUploadedSources([]);setStickyNotes([]);setCalendarEvents({});setTasks([]);setWeakAreas([]);setSubmitted(false);setTopic("");setSearchInput("");setSavedTopics([]);setProfileMenuOpen(false);setAuthMode(null);setActiveNav("dashboard");
    ["studybuddy-user","studybuddy-history","studybuddy-study-seconds","studybuddy-sources","studybuddy-sticky-notes","studybuddy-calendar-events","studybuddy-tasks","studybuddy-saved-topics"].forEach(k=>localStorage.removeItem(k));
  };
  const handleGoogleAuth=()=>{if(GOOGLE_AUTH_URL.includes("localhost:5000")){setCurrentUser(DEFAULT_USER);setAuthMode(null);return;}window.location.href=GOOGLE_AUTH_URL;};
  const handleSpotifyConnect=()=>{
    if(SPOTIFY_AUTH_URL){
      window.location.href=SPOTIFY_AUTH_URL;
      return;
    }
    window.alert("Add VITE_SPOTIFY_AUTH_URL to enable Spotify sign in.");
  };

  const usableStudySources=uploadedSources.filter(s=>s.kind==="text"&&s.text);
  const combinedSourceText=usableStudySources.map(s=>s.text).join(" ");
  const generatedFlashcards=buildFlashcardsFromText(combinedSourceText);
  const generatedQuestions=buildQuizFromText(combinedSourceText);
  const sourceLabel=usableStudySources.length>0?(usableStudySources.length===1?`"${usableStudySources[0].name}"`:`${usableStudySources.length} uploaded sources`):"";

  const currentMonth=calendarViewDate;
  const monthName=currentMonth.toLocaleString("en-IN",{month:"long",year:"numeric"});
  const firstDay=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
  const daysInMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,0).getDate();
  const monthOffset=firstDay.getDay();
  const studiedDayKeys=new Set(studyHistory.map(e=>toDateKey(e.searchedAt)));
  const yearOptions=Array.from({length:7},(_,i)=>new Date().getFullYear()-3+i);
  const calendarCells=Array.from({length:monthOffset+daysInMonth},(_,i)=>{
    if(i<monthOffset)return null;
    const day=i-monthOffset+1;
    const cellDate=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),day);
    return{dayNumber:day,dateKey:toDateKey(cellDate),isToday:toDateKey(cellDate)===toDateKey(new Date())};
  });
  const selectedDateEvents=calendarEvents[selectedCalendarDate]||[];
  const upcomingEvents=Array.from({length:5},(_,offset)=>{const date=new Date();date.setDate(date.getDate()+offset);const dateKey=toDateKey(date);return{dateKey,label:formatCalendarLabel(dateKey),events:calendarEvents[dateKey]||[]};}).filter(e=>e.events.length>0);

  const dashCards=[
    {id:"explain",    icon:"💡",label:"Explanation",desc:"Clear breakdowns at your level",cls:"card-blue",  badge:"AI powered",badgeCls:"badge-blue"},
    {id:"quiz",       icon:"📝",label:"Quiz",        desc:"Test yourself with MCQs",       cls:"card-amber", badge:"Practice",  badgeCls:"badge-amber"},
    {id:"flashcards", icon:"🃏",label:"Flashcards",  desc:"Review key terms fast",         cls:"card-teal",  badge:"Memorize",  badgeCls:"badge-teal"},
    {id:"pomodoro",   icon:"⏱",label:"Pomodoro",    desc:"Stay focused in sessions",       cls:"card-purple",badge:"Focus mode",badgeCls:"badge-purple"},
  ];

  if(!currentUser) return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-badge">Welcome To</div>
          <h1 className="auth-title">study buddy</h1>
          <p className="auth-sub">your learning companion</p>
          <div className="auth-divider"/>
          {!authMode?(
            <div style={{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"320px",margin:"0 auto"}}>
              <button className="auth-btn-primary" onClick={()=>setAuthMode("signup")}>Sign Up</button>
              <button className="auth-btn-secondary" onClick={()=>setAuthMode("login")}>Login</button>
            </div>
          ):(
            <div style={{maxWidth:"360px",margin:"0 auto"}}>
              <div className="glass-2" style={{padding:"28px",textAlign:"center"}}>
                <p style={{fontSize:"0.75rem",fontWeight:700,color:"var(--accent-2)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>{authMode==="signup"?"Create your account":"Welcome back"}</p>
                <p style={{fontSize:"0.875rem",color:"var(--text-2)",marginBottom:"20px"}}>Continue with Google to connect your account.</p>
                <button className="auth-btn-primary" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"10px",margin:"0 auto"}} onClick={handleGoogleAuth}>
                  <span style={{fontWeight:900}}>G</span> Continue with Google
                </button>
                <button onClick={()=>setAuthMode(null)} style={{background:"none",border:"none",color:"var(--text-3)",fontSize:"0.8rem",cursor:"pointer",marginTop:"16px",width:"100%"}}>← Back</button>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  return (
      <div className={`app-root${darkMode?" theme-dark":""}`}>
        {/* SIDEBAR */}
        <aside className={`sidebar glass ${sidebarCollapsed?"":"" }`} style={{width:sidebarCollapsed?72:220}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:sidebarCollapsed?"center":"space-between",marginBottom:"28px",padding:"0 4px"}}>
            {!sidebarCollapsed&&(
              <div>
                <div className="sidebar-logo">study<span>buddy</span></div>
                <div className="sidebar-sub">your learning companion</div>
              </div>
            )}
            <button className="btn-ghost" style={{padding:"6px 10px",fontSize:"0.8rem",flexShrink:0}} onClick={()=>setSidebarCollapsed(p=>!p)}>
              {sidebarCollapsed?"→":"←"}
            </button>
          </div>
          {!sidebarCollapsed&&<p className="sidebar-label">Menu</p>}
          <nav style={{display:"flex",flexDirection:"column",gap:"3px",flex:1}}>
            {NAV_ITEMS.map(item=>(
              <button key={item.id} onClick={()=>setActiveNav(item.id)}
                className={`nav-btn${activeNav===item.id?" active":""}`}
                style={{justifyContent:sidebarCollapsed?"center":"flex-start"}}>
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed&&item.label}
                {!sidebarCollapsed&&item.id==="weakareas"&&weakAreas.length>0&&(
                  <span className="tag tag-purple" style={{marginLeft:"auto",padding:"2px 6px"}}>{weakAreas.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-divider"/>
          <button onClick={()=>setActiveNav("settings")} className={`nav-btn${activeNav==="settings"?" active":""}`} style={{justifyContent:sidebarCollapsed?"center":"flex-start"}}>
            <span className="nav-icon">⚙️</span>
            {!sidebarCollapsed&&"Settings"}
          </button>
        </aside>

        {/* MAIN */}
        <main className="main-wrap">
          <div className="topbar glass">
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"var(--text-3)",fontSize:"0.9rem"}}>🔍</span>
              <input className="search-input" placeholder="Enter a topic to study... e.g. Photosynthesis" value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleTopicSubmit()}/>
            </div>
            {topic && (
              <button className="btn-ghost" style={{padding:"9px 12px",fontSize:"0.76rem",flexShrink:0}} onClick={handleSaveCurrentTopic}>
                Save Topic
              </button>
            )}
            <div style={{position:"relative",flexShrink:0}} ref={profileMenuRef}>
              <button className="avatar-btn" onClick={()=>setProfileMenuOpen(p=>!p)}>{userName[0]}</button>
              {profileMenuOpen&&(
                <div className="glass" style={{position:"absolute",right:0,top:"52px",width:"160px",padding:"6px",zIndex:120}}>
                  {[["Profile","profile"],["Logout","__logout"]].map(([label,id])=>(
                    <button key={id} onClick={()=>{if(id==="__logout")handleLogout();else{setActiveNav(id);setProfileMenuOpen(false);}}}
                      style={{display:"block",width:"100%",padding:"9px 12px",background:"none",border:"none",color:id==="__logout"?"var(--rose)":"var(--text-2)",fontSize:"0.82rem",cursor:"pointer",borderRadius:"8px",textAlign:"left",fontFamily:"var(--font)"}}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="content-scroll">
            {activeNav==="dashboard"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
                  <div>
                    <h2 className="section-title">Hey {userName}, ready to learn? 🧠</h2>
                    <p className="section-sub">{submitted?`Studying: "${topic}" — pick a mode below!`:"Enter a topic above and choose how you'd like to learn."}</p>
                  </div>
                  <div className="glass-2" style={{padding:"10px 12px",minWidth:"250px",display:"flex",alignItems:"center",gap:"10px",boxShadow:"var(--shadow)"}}>
                    <div style={{width:"40px",height:"40px",borderRadius:"12px",background:spotifyTrack?.image?"center / cover no-repeat": "linear-gradient(135deg,#1db954,#14833b)",backgroundImage:spotifyTrack?.image?`url(${spotifyTrack.image})`:undefined,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1rem",flexShrink:0}}>
                      {!spotifyTrack?.image && "♫"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:0,fontSize:"0.72rem",fontWeight:700,color:"#1db954",textTransform:"uppercase",letterSpacing:"0.08em"}}>Spotify</p>
                      {spotifyConnected?(
                        <>
                          <p style={{margin:"4px 0 0",fontSize:"0.88rem",fontWeight:700,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{spotifyTrack?.name}</p>
                          <p style={{margin:"2px 0 0",fontSize:"0.76rem",color:"var(--text-2)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{spotifyTrack?.artist} · {spotifyTrack?.duration || "Live sync via backend"}</p>
                        </>
                      ):(
                        <p style={{margin:"4px 0 0",fontSize:"0.8rem",color:"var(--text-2)"}}>Sign in with Spotify to show selected song and playback</p>
                      )}
                    </div>
                    <button className="btn-ghost" style={{padding:"8px 11px",fontSize:"0.74rem",flexShrink:0}} onClick={handleSpotifyConnect}>
                      {spotifyConnected?"Reconnect":"Connect"}
                    </button>
                  </div>
                </div>

                <div className="glass" style={{padding:"14px",overflowX:"auto"}}>
                  <div style={{display:"flex",gap:"14px",minWidth:"max-content",justifyContent:"center"}} onMouseLeave={()=>setDashFocus("explain")}>
                    {dashCards.map(card=>(
                      <button key={card.id} className={`dash-card ${card.cls}`}
                        onMouseEnter={()=>setDashFocus(card.id)} onClick={()=>setActiveNav(card.id)}
                        style={{transform:dashFocus===card.id?"scale(1.06)":"scale(0.96)",opacity:dashFocus===card.id?1:0.5,filter:dashFocus===card.id?"none":"blur(0.5px)",transition:"all 0.35s cubic-bezier(.4,0,.2,1)"}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"8px",position:"relative",zIndex:1}}>
                          <span style={{fontSize:"1.1rem"}}>{card.icon}</span>
                          <span className={`dash-card-badge ${card.badgeCls}`} style={{fontSize:"0.66rem",padding:"4px 8px"}}>{card.badge}</span>
                        </div>
                        <div className="dash-card-icon-bg" style={{background:"rgba(255,255,255,0.08)"}}/>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",flex:1,position:"relative",zIndex:1}}>
                          <span style={{fontSize:"2.6rem"}}>{card.icon}</span>
                        </div>
                        <div style={{position:"relative",zIndex:1}}>
                          <div className="dash-card-label">{card.label}</div>
                          <div className="dash-card-desc">{card.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:"grid",gap:"12px",gridTemplateColumns:"0.95fr 1.35fr"}}>
                  {/* Sticky Notes */}
                  <div className="glass" style={{padding:"16px",background:"rgba(245,158,11,0.04)",borderColor:"rgba(245,158,11,0.12)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
                      <h3 style={{fontSize:"0.875rem",fontWeight:700,color:"var(--text)"}}>🗒 Sticky Notes</h3>
                    </div>
                    <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
                      <input value={stickyNoteInput} onChange={e=>setStickyNoteInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleStickyNoteAdd()} placeholder="Write a note..."
                        style={{flex:1,background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"10px",padding:"9px 14px",color:"var(--text)",fontFamily:"var(--font)",fontSize:"0.8rem",outline:"none"}}/>
                      <button className="btn-primary" style={{padding:"9px 16px",fontSize:"0.78rem"}} onClick={handleStickyNoteAdd}>Add</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                      {stickyNotes.length>0?stickyNotes.slice(0,2).map((note,i)=>(
                        <div key={note.id} className={`sticky sticky-${i%4}`}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"6px"}}>
                            <p>{note.text}</p>
                            <button onClick={()=>handleStickyNoteDelete(note.id)} style={{background:"none",border:"none",cursor:"pointer",opacity:0.6,fontSize:"0.75rem",color:"inherit",flexShrink:0}}>✕</button>
                          </div>
                        </div>
                      )):<p style={{color:"var(--text-3)",fontSize:"0.78rem",gridColumn:"1/-1",padding:"8px 0"}}>No notes yet. Add a quick thought or study reminder.</p>}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="glass" style={{padding:"16px",position:"relative",background:"rgba(139,92,246,0.04)",borderColor:"rgba(139,92,246,0.12)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                      <h3 style={{fontSize:"0.875rem",fontWeight:700,color:"var(--text)"}}>📅 Mini Calendar</h3>
                      <select value={currentMonth.getFullYear()} onChange={e=>setCalendarViewDate(new Date(Number(e.target.value),currentMonth.getMonth(),1))}
                        style={{background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"8px",padding:"4px 8px",color:"var(--text)",fontSize:"0.75rem",fontFamily:"var(--font)",outline:"none"}}>
                        {yearOptions.map(y=><option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                      <button onClick={()=>setCalendarViewDate(p=>new Date(p.getFullYear(),p.getMonth()-1,1))}
                        style={{background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"8px",width:"28px",height:"28px",color:"var(--text-2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                      <p style={{flex:1,textAlign:"center",fontSize:"0.82rem",fontWeight:600,color:"#c4b5fd"}}>{monthName}</p>
                      <button onClick={()=>setCalendarViewDate(p=>new Date(p.getFullYear(),p.getMonth()+1,1))}
                        style={{background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"8px",width:"28px",height:"28px",color:"var(--text-2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"4px"}}>
                      {["S","M","T","W","T","F","S"].map((d,i)=><span key={i} style={{textAlign:"center",fontSize:"0.65rem",fontWeight:700,color:"var(--text-3)",padding:"4px 0"}}>{d}</span>)}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px"}}>
                      {calendarCells.map((cell,i)=>cell?(
                        <button key={cell.dateKey} onClick={()=>{setSelectedCalendarDate(cell.dateKey);setCalendarTabOpen(true);}}
                          className={`cal-day${cell.isToday?" today":selectedCalendarDate===cell.dateKey?" selected":studiedDayKeys.has(cell.dateKey)?" studied":""}`}>
                          <span style={{position:"relative"}}>{cell.dayNumber}{(calendarEvents[cell.dateKey]||[]).length>0&&<span style={{position:"absolute",bottom:"-6px",right:"-4px",fontSize:"7px"}}>🍅</span>}</span>
                        </button>
                      ):<div key={`b-${i}`} className="cal-day blank"/>)}
                    </div>

                    {calendarTabOpen&&(
                      <div className="glass" style={{position:"absolute",right:"16px",top:"64px",width:"300px",padding:"16px",zIndex:20,boxShadow:"var(--shadow-lg)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                          <div>
                            <p style={{fontSize:"0.82rem",fontWeight:600,color:"var(--text)"}}>Plans for {formatCalendarLabel(selectedCalendarDate)}</p>
                            <p style={{fontSize:"0.72rem",color:"var(--text-3)",marginTop:"2px"}}>Add an event for this date</p>
                          </div>
                          <button onClick={()=>setCalendarTabOpen(false)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:"0.8rem"}}>Close</button>
                        </div>
                        <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>
                          <input value={calendarEventInput} onChange={e=>setCalendarEventInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCalendarEventAdd()} placeholder="Add an event..."
                            style={{flex:1,background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"8px",padding:"8px 12px",color:"var(--text)",fontSize:"0.78rem",fontFamily:"var(--font)",outline:"none"}}/>
                          <button className="btn-primary" style={{padding:"8px 12px",fontSize:"0.75rem"}} onClick={handleCalendarEventAdd}>Add</button>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                          {selectedDateEvents.length>0?selectedDateEvents.map(ev=>(
                            <div key={ev.id} className="task-item">
                              <p style={{flex:1,fontSize:"0.78rem",color:"var(--text-2)"}}>{ev.text}</p>
                              <button onClick={()=>handleCalendarEventDelete(selectedCalendarDate,ev.id)} style={{background:"none",border:"none",color:"var(--rose)",fontSize:"0.7rem",cursor:"pointer"}}>✕</button>
                            </div>
                          )):<p style={{fontSize:"0.75rem",color:"var(--text-3)"}}>Nothing planned for this date yet.</p>}
                        </div>
                      </div>
                    )}

                    <div style={{marginTop:"8px",background:"var(--surface-2)",borderRadius:"12px",padding:"10px"}}>
                      <p style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-2)",marginBottom:"8px"}}>⏳ Upcoming Events</p>
                      {upcomingEvents.length>0?upcomingEvents.slice(0,2).map(entry=>(
                        <div key={entry.dateKey} style={{marginBottom:"8px"}}>
                          <p style={{fontSize:"0.68rem",fontWeight:700,color:"#c4b5fd",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>{entry.label}</p>
                          {entry.events.map(ev=><p key={ev.id} style={{fontSize:"0.78rem",color:"var(--text-2)",paddingLeft:"8px"}}>{ev.text}</p>)}
                        </div>
                      )):<p style={{fontSize:"0.75rem",color:"var(--text-3)"}}>No upcoming events in next 5 days.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeNav==="explain"    &&<ExplanationPanel topic={topic} topicRequestKey={topicRequestKey}/>}
            {activeNav==="quiz"       &&<QuizPanel topic={topic} topicRequestKey={topicRequestKey} onWeakAreas={handleWeakAreas} questions={generatedQuestions} sourceLabel={!topic?sourceLabel:""} onFilesSelected={handleSourceFilesSelected} pastedNotes={pastedNotes} onPastedNotesChange={setPastedNotes} onSavePastedNotes={handleSavePastedNotes}/>}
            {activeNav==="flashcards" &&<FlashcardsPanel topic={topic} topicRequestKey={topicRequestKey} cards={generatedFlashcards} sourceLabel={!topic?sourceLabel:""} onFilesSelected={handleSourceFilesSelected} pastedNotes={pastedNotes} onPastedNotesChange={setPastedNotes} onSavePastedNotes={handleSavePastedNotes}/>}
            {activeNav==="pomodoro"   &&<PomodoroPanel onStudyTick={handleStudyTick} onStateChange={setPomodoroStatus}/>}
            {activeNav==="weakareas"  &&<WeakAreasPanel weakAreas={weakAreas} onGoToQuiz={()=>setActiveNav("quiz")}/>}

            {activeNav==="saved"&&(
              <div style={{maxWidth:"860px"}}>
                <div className="glass" style={{padding:"24px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",marginBottom:"18px",flexWrap:"wrap"}}>
                    <div>
                      <h2 style={{fontSize:"1.5rem",fontWeight:800,color:"var(--text)",margin:0}}>Saved Topics</h2>
                      <p style={{fontSize:"0.82rem",color:"var(--text-3)",marginTop:"6px"}}>Store topics you want to come back to later.</p>
                    </div>
                    <button className="btn-primary" style={{padding:"10px 14px",fontSize:"0.8rem"}} onClick={handleStartFreshTopic}>Start New Topic</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                    {savedTopics.length>0 ? savedTopics.map(item=>(
                      <div key={item.id} className="glass-2" style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
                        <div style={{minWidth:0,flex:1}}>
                          <p style={{fontSize:"0.95rem",fontWeight:700,color:"var(--text)",margin:0}}>{item.topic}</p>
                          <p style={{fontSize:"0.74rem",color:"var(--text-3)",marginTop:"4px"}}>Saved {formatHistoryDate(item.savedAt)}{item.weakAreas?.length ? ` � ${item.weakAreas.length} weak area${item.weakAreas.length !== 1 ? "s" : ""}` : ""}</p>
                        </div>
                        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                          <button className="btn-ghost" style={{padding:"9px 12px",fontSize:"0.78rem"}} onClick={()=>handleResumeSavedTopic(item)}>Resume</button>
                          <button className="btn-ghost" style={{padding:"9px 12px",fontSize:"0.78rem",color:"var(--rose)"}} onClick={()=>handleDeleteSavedTopic(item.id)}>Delete</button>
                        </div>
                      </div>
                    )) : (
                      <div className="glass-2" style={{padding:"18px 16px"}}>
                        <p style={{fontSize:"0.85rem",color:"var(--text-2)",margin:0}}>No saved topics yet. Search a topic, work on it, then click `Save Topic` in the top bar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeNav==="profile"&&(
              <div style={{maxWidth:"900px",display:"grid",gap:"16px",gridTemplateColumns:"1.2fr 1fr"}}>
                <div className="glass" style={{padding:"24px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:"16px",marginBottom:"24px"}}>
                    <div style={{width:"52px",height:"52px",borderRadius:"14px",background:"linear-gradient(135deg,var(--accent),var(--teal))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:"1.2rem",color:"var(--bg)",flexShrink:0}}>{userName[0]}</div>
                    <div><h2 style={{fontSize:"1.4rem",fontWeight:800,color:"var(--text)"}}>Profile</h2><p style={{fontSize:"0.8rem",color:"var(--text-3)",marginTop:"3px"}}>Connected account details</p></div>
                  </div>
                  {currentUser&&["name","email","provider"].map(field=>(
                    <div key={field} className="glass-2" style={{padding:"14px 16px",marginBottom:"10px"}}>
                      <p className="panel-section-title">{field.charAt(0).toUpperCase()+field.slice(1)}</p>
                      <p style={{fontSize:"1rem",fontWeight:600,color:"var(--text)",marginTop:"6px"}}>{currentUser[field]}</p>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                  <div className="glass" style={{padding:"24px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
                      <div><h3 style={{fontSize:"1rem",fontWeight:700,color:"var(--text)"}}>Study History</h3><p style={{fontSize:"0.75rem",color:"var(--text-3)",marginTop:"2px"}}>Topics searched</p></div>
                      <span className="tag tag-purple">{studyHistory.length} total</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"220px",overflowY:"auto"}}>
                      {studyHistory.length>0?studyHistory.map(entry=>(
                        <div key={entry.id} className="glass-2" style={{padding:"12px 14px"}}>
                          <p style={{fontWeight:600,fontSize:"0.85rem",color:"var(--text)"}}>{entry.topic}</p>
                          <p style={{fontSize:"0.7rem",color:"var(--text-3)",marginTop:"3px"}}>{formatHistoryDate(entry.searchedAt)}</p>
                        </div>
                      )):<p style={{fontSize:"0.8rem",color:"var(--text-3)"}}>No study history yet.</p>}
                    </div>
                  </div>
                  <div className="glass" style={{padding:"20px",background:"rgba(244,63,94,0.05)",borderColor:"rgba(244,63,94,0.15)"}}>
                    <h3 style={{fontSize:"0.95rem",fontWeight:700,color:"#fda4af",marginBottom:"8px"}}>Delete Account</h3>
                    <p style={{fontSize:"0.78rem",color:"var(--text-2)",marginBottom:"14px",lineHeight:1.5}}>Clears your local profile and study history on this device.</p>
                    <button onClick={handleDeleteAccount} style={{background:"var(--rose)",border:"none",borderRadius:"10px",padding:"9px 18px",color:"#fff",fontFamily:"var(--font)",fontSize:"0.8rem",fontWeight:700,cursor:"pointer"}}>Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {activeNav==="settings"&&(
              <div style={{maxWidth:"600px"}}>
                <div className="glass" style={{padding:"28px"}}>
                  <h2 style={{fontSize:"1.4rem",fontWeight:800,color:"var(--text)",marginBottom:"6px"}}>Settings</h2>
                  <p style={{fontSize:"0.82rem",color:"var(--text-3)",marginBottom:"20px"}}>Adjust how your study buddy feels.</p>
                  <div className="glass-2" style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <p style={{fontWeight:600,color:"var(--text)",fontSize:"0.9rem"}}>Theme</p>
                      <p style={{fontSize:"0.78rem",color:"var(--text-3)",marginTop:"3px"}}>{darkMode ? "Dark mode is on." : "Light mode is on."}</p>
                    </div>
                    <button className="btn-primary" style={{padding:"10px 14px",fontSize:"0.8rem"}} onClick={()=>setDarkMode(v=>!v)}>
                      Switch to {darkMode ? "Light" : "Dark"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="right-panel">
          <ChecklistPanel tasks={tasks} taskInput={taskInput} onTaskInputChange={setTaskInput} onTaskAdd={handleTaskAdd} onTaskToggle={handleTaskToggle} onTaskDelete={handleTaskDelete}/>
          <div className="glass" style={{padding:"12px",display:"flex",flexDirection:"column",flex:1}}>
            <p className="panel-section-title" style={{marginBottom:"8px"}}>Today's Progress</p>
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {[{label:"Topics studied",value:submitted?"1":"0",cls:"tag-rose"},{label:"Quizzes done",value:"0",cls:"tag-amber"},{label:"Flashcards",value:"0",cls:"tag-blue"}].map(s=>(
                <div key={s.label} className="stat-row">
                  <span className="stat-label">{s.label}</span>
                  <span className={`stat-value tag ${s.cls}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:"10px",borderRadius:"12px",padding:"12px",background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.12)",textAlign:"center",display:"flex",flexDirection:"column",justifyContent:"center",flex:1}}>
              <div style={{fontSize:"2rem",marginBottom:"4px"}}>🍅</div>
              <p style={{fontSize:"1rem",fontWeight:800,color:"var(--text)"}}>{formatStudyTime(studySeconds)}</p>
              <p className="panel-section-title" style={{marginTop:"4px"}}>Total study time</p>
            </div>
          </div>
        </aside>
      </div>
  );
}







