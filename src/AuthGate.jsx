import React, { useState } from 'react';
import { Apple, ArrowRight, Check, Chrome, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, supabase } from './supabase.js';
import './auth.css';

export default function AuthGate({ onDemo, recovery = false, onRecoveryComplete }) {
  const [mode, setMode] = useState(recovery ? 'recovery' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  const submit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    if (!isSupabaseConfigured) {
      setError('A fiókhasználathoz előbb be kell állítani a Supabase-kapcsolatot.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'recovery') {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) setError(updateError.message);
        else {
          setNotice('A jelszavad megváltozott. Most már beléphetsz az új jelszóval.');
          onRecoveryComplete?.();
        }
      } else if (isSignup) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (authError) setError(authError.message);
        else if (!data.session) setNotice('Ellenőrizd az e-mailjeidet a regisztráció megerősítéséhez.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) setError(authError.message);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Nem sikerült kapcsolódni. Próbáld újra.');
    } finally {
      setBusy(false);
    }
  };

  const socialSignIn = async (provider) => {
    setNotice('');
    setError('');
    if (!isSupabaseConfigured) {
      setError('A Google- és Apple-belépéshez Supabase- és szolgáltatói OAuth-beállítás szükséges.');
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (authError) setError(authError.message);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Nem sikerült elindítani a bejelentkezést.');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setNotice('');
    setError('');
    if (!isSupabaseConfigured) {
      setError('A jelszó-visszaállításhoz előbb be kell állítani a Supabase-kapcsolatot.');
      return;
    }
    if (!email.trim()) {
      setError('Add meg az e-mail-címedet a visszaállító link elküldéséhez.');
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
      if (authError) setError(authError.message);
      else setNotice('Ha tartozik fiók ehhez a címhez, elküldtük a visszaállító linket.');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Nem sikerült elküldeni az e-mailt.');
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'recovery' ? 'Új jelszó beállítása' : isSignup ? 'Hozd létre a fiókodat' : 'Lépj be a munkateredbe';
  const description = mode === 'recovery' ? 'Válassz egy új jelszót a MarketMate-fiókodhoz.' : isSignup ? 'Kezdd el összehangolni a marketingedet.' : 'A terveid és tartalmaid már várnak.';

  return <main className="auth-page">
    <header className="auth-topbar">
      <a className="auth-brand" href="#home" aria-label="MarketMate AI főoldal"><span><Sparkles size={18}/></span>marketmate<b>AI</b></a>
      <a className="auth-toplink" href="#login">{isSignup ? 'Már van fiókod?' : 'Már használod a MarketMate-et?'} <b>{isSignup ? 'Bejelentkezés' : 'Belépés'}</b></a>
    </header>

    <section className="auth-layout" id="home">
      <div className="auth-story">
        <div className="story-copy">
          <span className="story-kicker"><Sparkles size={14}/> MARKETING, EGY HELYEN</span>
          <h1>Jó ötletből<br/><em>következetes</em><br/>jelenlét.</h1>
          <p>Tervezd meg a tartalmaidat, lásd át a kampányaidat, és tartsd kézben a jóváhagyást egyetlen munkatérben.</p>
          <ul>
            <li><Check size={16}/> Tartalomnaptár és jóváhagyási folyamat</li>
            <li><Check size={16}/> Márkahanghoz igazított tartalomötletek</li>
            <li><Check size={16}/> Átlátható kampánytervezés</li>
          </ul>
        </div>
        <div className="story-note"><span>01 / 03</span><b>Tervezésből lendület.</b><span>MarketMate AI</span></div>
      </div>

      <section className="auth-panel" id="login" aria-labelledby="auth-title">
        <div className="auth-panel-head">
          <span className="auth-step">{mode === 'recovery' ? 'FIÓK VÉDELEM' : isSignup ? 'KEZDŐ LÉPÉS' : 'ÜDV ÚJRA'}</span>
          <h2 id="auth-title">{title}</h2>
          <p>{description}</p>
        </div>

        {mode !== 'recovery' && <>
          <div className="social-auth">
            <button type="button" onClick={() => socialSignIn('google')} disabled={busy}><Chrome size={17}/> Folytatás Google-fiókkal</button>
            <button type="button" onClick={() => socialSignIn('apple')} disabled={busy}><Apple size={18}/> Folytatás Apple-fiókkal</button>
          </div>
          <div className="auth-divider"><span>vagy e-mail-címmel</span></div>
        </>}

        <form className="auth-form" onSubmit={submit}>
          {mode !== 'recovery' && <>
            <label htmlFor="auth-email">E-mail-cím</label>
            <div className="auth-input"><Mail size={17}/><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="nev@vallalkozas.hu"/></div>
          </>}
          <div className="password-label"><label htmlFor="auth-password">{mode === 'recovery' ? 'Új jelszó' : 'Jelszó'}</label>{mode === 'login'&&<button type="button" onClick={resetPassword} disabled={busy}>Elfelejtetted?</button>}</div>
          <div className="auth-input"><LockKeyhole size={17}/><input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="Legalább 8 karakter"/></div>
          {(isSignup || mode === 'recovery')&&<small className="password-hint">Legalább 8 karakteres jelszót válassz.</small>}
          {error&&<p className="auth-message error" role="alert">{error}</p>}
          {notice&&<p className="auth-message success" role="status">{notice}</p>}
          {!isSupabaseConfigured&&mode !== 'recovery'&&<p className="config-note">A valódi fiókokhoz még be kell állítani a Supabase-kapcsolatot. A demó megnyitható.</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy?'Feldolgozás…':mode === 'recovery'?'Jelszó mentése':isSignup?'Regisztráció':'Bejelentkezés'}<ArrowRight size={17}/></button>
        </form>

        {mode === 'login' && <p className="auth-switch">Még nincs fiókod? <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }}>Regisztrálj</button></p>}
        {isSignup && <p className="auth-switch">Már regisztráltál? <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Jelentkezz be</button></p>}
        <div className="auth-bottom"><span><LockKeyhole size={13}/> Biztonságos fiókhozzáférés</span>{mode === 'recovery' ? <button type="button" onClick={onRecoveryComplete}>Vissza a belépéshez</button> : <button type="button" onClick={onDemo}>Kipróbálom demóként</button>}</div>
      </section>
    </section>
    <footer className="auth-footer"><span>© 2026 MarketMate AI</span><span>Tervezd meg. Hagyd jóvá. Növekedj.</span></footer>
  </main>;
}
