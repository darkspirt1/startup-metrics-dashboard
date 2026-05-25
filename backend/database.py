import sqlite3
import random
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/metrics.db")


def create_tables(conn):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            user_id     TEXT PRIMARY KEY,
            signed_up   TEXT NOT NULL,
            device      TEXT NOT NULL,
            location    TEXT NOT NULL,
            source      TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            session_id  TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            started_at  TEXT NOT NULL,
            duration_s  INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS events (
            event_id    TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            session_id  TEXT NOT NULL,
            event_type  TEXT NOT NULL,
            occurred_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS purchases (
            purchase_id TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            amount_usd  REAL NOT NULL,
            occurred_at TEXT NOT NULL
        );
    """)
    conn.commit()


def seed_data(conn):
    random.seed(42)

    DEVICES = ["mobile"] * 58 + ["desktop"] * 42
    LOCATIONS = ["IN"] * 40 + ["US"] * 25 + ["EU"] * 20 + ["APAC"] * 15
    SOURCES = ["organic"] * 45 + ["paid"] * \
        30 + ["referral"] * 15 + ["social"] * 10

    SIGNUP_RATE = {"mobile": 0.44, "desktop": 0.71}
    CART_RATE = {"mobile": 0.45, "desktop": 0.60}
    PURCHASE_RATE = {"mobile": 0.11, "desktop": 0.14}

    base_date = datetime.now() - timedelta(days=90)

    users, sessions, events, purchases = [], [], [], []

    for uid in range(1, 3501):
        user_id = f"u{uid:05d}"
        device = random.choice(DEVICES)
        location = random.choice(LOCATIONS)
        source = random.choice(SOURCES)

        day_offset = int(random.betavariate(1.5, 1.0) * 90)
        signup_dt = base_date + timedelta(
            days=day_offset,
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )

        users.append((user_id, signup_dt.isoformat(),
                     device, location, source))

        for s in range(random.randint(1, 8)):
            sess_id = f"s{uid:05d}{s:02d}"
            sess_dt = signup_dt + \
                timedelta(days=random.randint(0, 90 - day_offset))
            duration = random.randint(60, 900)
            sessions.append((sess_id, user_id, sess_dt.isoformat(), duration))

            ev_id = f"e{uid:05d}{s:02d}v"
            events.append((ev_id, user_id, sess_id,
                          "visit", sess_dt.isoformat()))

            if s == 0 and random.random() < SIGNUP_RATE[device]:
                ev_dt = sess_dt + timedelta(seconds=random.randint(30, 120))
                events.append((f"e{uid:05d}{s:02d}sg", user_id,
                              sess_id, "signup", ev_dt.isoformat()))

                if random.random() < CART_RATE[device]:
                    ev_dt2 = ev_dt + timedelta(seconds=random.randint(60, 300))
                    events.append(
                        (f"e{uid:05d}{s:02d}ac", user_id, sess_id, "add_to_cart", ev_dt2.isoformat()))

                    if random.random() < PURCHASE_RATE[device]:
                        ev_dt3 = ev_dt2 + \
                            timedelta(seconds=random.randint(30, 180))
                        events.append(
                            (f"e{uid:05d}{s:02d}pu", user_id, sess_id, "purchase", ev_dt3.isoformat()))
                        amount = round(random.uniform(9.99, 199.99), 2)
                        purchases.append(
                            (f"p{uid:05d}{s:02d}", user_id, amount, ev_dt3.isoformat()))

    conn.executemany("INSERT OR IGNORE INTO users VALUES (?,?,?,?,?)", users)
    conn.executemany(
        "INSERT OR IGNORE INTO sessions VALUES (?,?,?,?)", sessions)
    conn.executemany("INSERT OR IGNORE INTO events VALUES (?,?,?,?,?)", events)
    conn.executemany(
        "INSERT OR IGNORE INTO purchases VALUES (?,?,?,?)", purchases)
    conn.commit()

    print(
        f"Seeded: {len(users)} users | {len(sessions)} sessions | {len(events)} events | {len(purchases)} purchases")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    create_tables(conn)

    count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if count == 0:
        seed_data(conn)
    else:
        print(f"DB already has {count} users — skipping seed.")
    conn.close()


if __name__ == "__main__":
    init_db()
