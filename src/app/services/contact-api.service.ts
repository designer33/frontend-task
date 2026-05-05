import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { Contact, EmailAddress } from '../models/contact.model';

const API_BASE_URL = 'https://67fe7eaf2a80b06b8896d01e.mockapi.io/api/v1';

// ─── Mock Data (same as original api.js) ─────────────────────────────────────

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1', firstName: 'Johanna', lastName: 'Stevens',
    avatar: 'assets/images/thumb2.png', jobTitle: 'Project Manager',
    bio: 'Experienced project manager with a passion for delivering high-quality software solutions on time and within budget.',
    phone: ['439-582-1578', '621-770-7689'], address: '14 Oak Avenue, New York, NY 10001',
    dial: 'j.stevens@ymsg.com', meeting: 'http://go.betacall.com/meet/j.stevens',
    social: { facebook: '#', twitter: '#', linkedin: '#', pinterest: '#' },
    status: 'online', createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', firstName: 'Nicholas', lastName: 'Gordon',
    avatar: null, jobTitle: 'Developer',
    bio: 'Full-stack developer specialising in React and Node.js. Open source contributor and tech blogger.',
    phone: ['312-555-0192'], address: '88 Lakeshore Dr, Chicago, IL 60601',
    dial: 'n.gordon@ymsg.com', meeting: 'http://go.betacall.com/meet/n.gordon',
    social: { facebook: '#', twitter: '#', linkedin: '#' },
    status: 'online', createdAt: '2024-01-18T09:00:00Z'
  },
  {
    id: '3', firstName: 'Bradley', lastName: 'Malone',
    avatar: 'assets/images/thumb1.png', jobTitle: 'Sales Manager',
    bio: 'Sales leader with 10+ years driving revenue growth across enterprise SaaS accounts in the EMEA region.',
    phone: ['617-555-0134', '617-555-0199'], address: '22 Beacon St, Boston, MA 02108',
    dial: 'b.malone@ymsg.com', meeting: 'http://go.betacall.com/meet/b.malone',
    social: { linkedin: '#', twitter: '#' },
    status: 'away', createdAt: '2024-02-02T14:20:00Z'
  },
  {
    id: '4', firstName: 'Marvin', lastName: 'Lambert',
    avatar: 'assets/images/thumb3.png', jobTitle: 'Designer',
    bio: 'Product designer focused on user-centred design systems. Figma expert, lover of typography and white space.',
    phone: ['415-555-0177'], address: '500 Market St, San Francisco, CA 94105',
    dial: 'm.lambert@ymsg.com', meeting: 'http://go.betacall.com/meet/m.lambert',
    social: { instagram: '#', pinterest: '#', linkedin: '#' },
    status: 'away', createdAt: '2024-02-10T11:45:00Z'
  },
  {
    id: '5', firstName: 'Teresa', lastName: 'Lloyd',
    avatar: null, jobTitle: 'PR Agent',
    bio: 'Communications strategist with experience across tech, fashion and media verticals. Storytelling is my superpower.',
    phone: ['202-555-0143'], address: '1600 Penn Ave, Washington, DC 20500',
    dial: 't.lloyd@ymsg.com', meeting: 'http://go.betacall.com/meet/t.lloyd',
    social: { twitter: '#', linkedin: '#' },
    status: 'away', createdAt: '2024-02-14T16:00:00Z'
  },
  {
    id: '6', firstName: 'Fred', lastName: 'Haynes',
    avatar: 'assets/images/thumb4.png', jobTitle: 'Support Team Lead',
    bio: 'Customer success champion. Believes the best support is the kind the customer never needs but always appreciates.',
    phone: ['713-555-0108', '713-555-0200'], address: '1001 Main St, Houston, TX 77002',
    dial: 'f.haynes@ymsg.com', meeting: 'http://go.betacall.com/meet/f.haynes',
    social: { facebook: '#', linkedin: '#' },
    status: 'away', createdAt: '2024-03-01T08:30:00Z'
  },
  {
    id: '7', firstName: 'Rose', lastName: 'Peters',
    avatar: 'assets/images/thumb5.png', jobTitle: 'Project Manager',
    bio: 'Agile-certified PM who has successfully shipped 30+ products. Scrum master and cross-functional team builder.',
    phone: ['206-555-0165'], address: '400 Pine St, Seattle, WA 98101',
    dial: 'r.peters@ymsg.com', meeting: 'http://go.betacall.com/meet/r.peters',
    social: { linkedin: '#', twitter: '#', facebook: '#' },
    status: 'away', createdAt: '2024-03-05T13:15:00Z'
  },
  {
    id: '8', firstName: 'Brian', lastName: 'Watson',
    avatar: null, jobTitle: 'Developer',
    bio: 'Backend engineer with expertise in distributed systems and cloud infrastructure. AWS certified solutions architect.',
    phone: ['602-555-0129'], address: '200 E Van Buren St, Phoenix, AZ 85004',
    dial: 'b.watson@ymsg.com', meeting: 'http://go.betacall.com/meet/b.watson',
    social: { github: '#', linkedin: '#' },
    status: 'online', createdAt: '2024-03-10T10:00:00Z'
  },
  {
    id: '9', firstName: 'Hettie', lastName: 'Richardson',
    avatar: null, jobTitle: 'Developer',
    bio: 'Mobile developer specialising in React Native. Published 5 apps on the App Store and Google Play Store.',
    phone: ['404-555-0187'], address: '55 Marietta St, Atlanta, GA 30303',
    dial: 'h.richardson@ymsg.com', meeting: 'http://go.betacall.com/meet/h.richardson',
    social: { linkedin: '#', twitter: '#' },
    status: 'online', createdAt: '2024-03-15T09:30:00Z'
  },
  {
    id: '10', firstName: 'Laura', lastName: 'Mitchell',
    avatar: null, jobTitle: 'Marketing Manager',
    bio: 'Data-driven marketer with expertise in SEO, content strategy and growth hacking. Former startup CMO.',
    phone: ['512-555-0143', '512-555-0200'], address: '300 W 6th St, Austin, TX 78701',
    dial: 'l.mitchell@ymsg.com', meeting: 'http://go.betacall.com/meet/l.mitchell',
    social: { linkedin: '#', twitter: '#', facebook: '#' },
    status: 'online', createdAt: '2024-03-20T11:00:00Z'
  },
  {
    id: '11', firstName: 'Daniel', lastName: 'Chen',
    avatar: null, jobTitle: 'Data Analyst',
    bio: 'Turning raw data into business insights since 2015. Python, SQL, Tableau. Numbers are just stories waiting to be told.',
    phone: ['213-555-0156'], address: '350 S Grand Ave, Los Angeles, CA 90071',
    dial: 'd.chen@ymsg.com', meeting: 'http://go.betacall.com/meet/d.chen',
    social: { linkedin: '#', github: '#' },
    status: 'away', createdAt: '2024-03-25T14:30:00Z'
  },
  {
    id: '12', firstName: 'Samantha', lastName: 'Webb',
    avatar: null, jobTitle: 'UX Researcher',
    bio: 'Human behaviour enthusiast. Runs usability studies, diary studies and contextual inquiry. Ex-academic, now industry UXR.',
    phone: ['503-555-0178'], address: '1 SW Columbia St, Portland, OR 97201',
    dial: 's.webb@ymsg.com', meeting: 'http://go.betacall.com/meet/s.webb',
    social: { linkedin: '#', twitter: '#' },
    status: 'online', createdAt: '2024-04-01T09:00:00Z'
  }
];

const MOCK_EMAILS: Record<string, EmailAddress[]> = {
  '1':  [{ id: 'e1a', contactId: '1',  email: 'johanna.stevens@gmail.com',      isPrimary: true  },
         { id: 'e1b', contactId: '1',  email: 'johanna.stevens@whiteui.store',  isPrimary: false }],
  '2':  [{ id: 'e2a', contactId: '2',  email: 'nicholas.gordon@gmail.com',      isPrimary: true  },
         { id: 'e2b', contactId: '2',  email: 'n.gordon@devmail.io',            isPrimary: false }],
  '3':  [{ id: 'e3a', contactId: '3',  email: 'bradley.malone@salesforce.com',  isPrimary: true  }],
  '4':  [{ id: 'e4a', contactId: '4',  email: 'marvin.lambert@design.io',       isPrimary: true  },
         { id: 'e4b', contactId: '4',  email: 'm.lambert@freelance.net',        isPrimary: false }],
  '5':  [{ id: 'e5a', contactId: '5',  email: 'teresa.lloyd@pr.agency',         isPrimary: true  }],
  '6':  [{ id: 'e6a', contactId: '6',  email: 'fred.haynes@support.co',         isPrimary: true  },
         { id: 'e6b', contactId: '6',  email: 'f.haynes@personal.com',          isPrimary: false }],
  '7':  [{ id: 'e7a', contactId: '7',  email: 'rose.peters@pm.org',             isPrimary: true  }],
  '8':  [{ id: 'e8a', contactId: '8',  email: 'brian.watson@clouddev.io',       isPrimary: true  },
         { id: 'e8b', contactId: '8',  email: 'b.watson@gmail.com',             isPrimary: false }],
  '9':  [{ id: 'e9a', contactId: '9',  email: 'hettie.r@mobiledev.app',         isPrimary: true  }],
  '10': [{ id: 'e10a', contactId: '10', email: 'laura.mitchell@marketing.co',   isPrimary: true  },
         { id: 'e10b', contactId: '10', email: 'l.mitchell@gmail.com',          isPrimary: false }],
  '11': [{ id: 'e11a', contactId: '11', email: 'daniel.chen@analytics.io',      isPrimary: true  }],
  '12': [{ id: 'e12a', contactId: '12', email: 'samantha.webb@uxresearch.com',  isPrimary: true  },
         { id: 'e12b', contactId: '12', email: 's.webb@gmail.com',              isPrimary: false }]
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ContactApiService {

  /** Emits true when the app has fallen back to mock data */
  readonly usingMockData$ = new BehaviorSubject<boolean>(false);

  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  /**
   * GET /contacts — falls back to MOCK_CONTACTS on error.
   */
  getContacts(): Observable<Contact[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.baseUrl}/contacts`).pipe(
      map(data => data.map(c => this.normaliseContact(c))),
      catchError(err => {
        console.warn('[ContactApiService] getContacts() fell back to mock data:', err.message);
        this.usingMockData$.next(true);
        return of([...MOCK_CONTACTS]).pipe(delay(600));
      })
    );
  }

  /**
   * GET /contacts/{id}/email_addresses — falls back to MOCK_EMAILS on error.
   */
  getEmailAddresses(contactId: string): Observable<EmailAddress[]> {
    return this.http.get<EmailAddress[]>(`${this.baseUrl}/contacts/${contactId}/email_addresses`).pipe(
      catchError(err => {
        console.warn(`[ContactApiService] getEmailAddresses(${contactId}) fell back to mock data:`, err.message);
        return of(MOCK_EMAILS[contactId] ?? []).pipe(delay(200));
      })
    );
  }

  /** Normalise raw API response to our Contact shape. */
  private normaliseContact(raw: Record<string, unknown>): Contact {
    const name = typeof raw['name'] === 'string' ? raw['name'] : '';
    return {
      id:        String(raw['id']),
      firstName: (raw['firstName'] as string) || (raw['first_name'] as string) || name.split(' ')[0] || 'Unknown',
      lastName:  (raw['lastName']  as string) || (raw['last_name']  as string) || name.split(' ')[1] || '',
      avatar:    (raw['avatar']    as string) || null,
      jobTitle:  (raw['jobTitle']  as string) || (raw['job_title'] as string)  || (raw['role'] as string) || '',
      bio:       (raw['bio']       as string) || (raw['description'] as string) || '',
      phone:     Array.isArray(raw['phone']) ? raw['phone'] as string[] : (raw['phone'] ? [raw['phone'] as string] : []),
      address:   (raw['address']   as string) || '',
      dial:      (raw['dial']      as string) || '',
      meeting:   (raw['meeting']   as string) || '',
      social:    (raw['social']    as Record<string, string>) || {},
      status:    ((raw['status'] as string) === 'online' ? 'online' : 'away'),
      createdAt: (raw['createdAt'] as string) || new Date().toISOString(),
    };
  }
}
