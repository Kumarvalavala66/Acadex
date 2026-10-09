from fastapi import APIRouter

router = APIRouter(
    prefix="/holidays",
    tags=["Holidays"],
)


HOLIDAYS_2026 = [
    {
        "date": "2026-01-14",
        "name": "Bhogi",
        "type": "public_holiday",
    },
    {
        "date": "2026-01-15",
        "name": "Makara Sankranti",
        "type": "public_holiday",
    },
    {
        "date": "2026-01-16",
        "name": "Kanuma",
        "type": "public_holiday",
    },
    {
        "date": "2026-01-26",
        "name": "Republic Day",
        "type": "public_holiday",
    },
    {
        "date": "2026-02-15",
        "name": "Maha Sivaratri",
        "type": "public_holiday",
    },
    {
        "date": "2026-03-03",
        "name": "Holi",
        "type": "public_holiday",
    },
    {
        "date": "2026-03-19",
        "name": "Ugadi",
        "type": "public_holiday",
    },
    {
        "date": "2026-03-20",
        "name": "Eid-ul-Fitr (Ramzan)",
        "type": "public_holiday",
    },
    {
        "date": "2026-03-27",
        "name": "Sri Rama Navami",
        "type": "public_holiday",
    },
    {
        "date": "2026-04-03",
        "name": "Good Friday",
        "type": "public_holiday",
    },
    {
        "date": "2026-04-05",
        "name": "Babu Jagjivan Ram's Birthday",
        "type": "public_holiday",
    },
    {
        "date": "2026-04-14",
        "name": "Dr. B.R. Ambedkar's Birthday",
        "type": "public_holiday",
    },
    {
        "date": "2026-05-27",
        "name": "Eid-ul-Adha (Bakrid)",
        "type": "public_holiday",
    },
    {
        "date": "2026-06-25",
        "name": "Moharrum",
        "type": "public_holiday",
    },
    {
        "date": "2026-08-15",
        "name": "Independence Day",
        "type": "public_holiday",
    },
    {
        "date": "2026-08-21",
        "name": "Vara Lakshmi Vratham",
        "type": "public_holiday",
    },
    {
        "date": "2026-08-25",
        "name": "Milad-un-Nabi",
        "type": "public_holiday",
    },
    {
        "date": "2026-09-04",
        "name": "Sri Krishnashtami",
        "type": "public_holiday",
    },
    {
        "date": "2026-09-14",
        "name": "Vinayaka Chavithi",
        "type": "public_holiday",
    },
    {
        "date": "2026-10-02",
        "name": "Mahatma Gandhi Jayanthi",
        "type": "public_holiday",
    },
    {
        "date": "2026-10-18",
        "name": "Durgashtami",
        "type": "public_holiday",
    },
    {
        "date": "2026-10-20",
        "name": "Vijaya Dasami",
        "type": "public_holiday",
    },
    {
        "date": "2026-11-08",
        "name": "Deepavali",
        "type": "public_holiday",
    },
    {
        "date": "2026-12-25",
        "name": "Christmas",
        "type": "public_holiday",
    },
]


@router.get("")
def get_public_holidays():
    return HOLIDAYS_2026
