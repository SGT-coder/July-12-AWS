
import type { Submission, User } from '@/lib/types';

export const initialUsers: User[] = [
    {
      "id": "admin-001",
      "name": "ADMIN",
      "email": "admin@example.com",
      "password": "admin123",
      "role": "Admin",
      "status": "Approved",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "statusUpdatedAt": "2025-07-09T08:22:46.359Z"
    },
    {
      "id": "approver-001",
      "name": "Dr. Selamawit",
      "email": "approver@example.com",
      "password": "password",
      "role": "Approver",
      "status": "Approved",
      "createdAt": "2024-01-02T11:00:00.000Z",
      "statusUpdatedAt": "2024-01-02T11:00:00.000Z"
    },
    {
      "id": "pending-user-001",
      "name": "Pending Approver",
      "email": "pending@example.com",
      "password": "password",
      "role": "Approver",
      "status": "Pending",
      "createdAt": "2024-07-10T12:00:00.000Z",
      "statusUpdatedAt": "2025-07-09T09:26:09.191Z"
    }
];


export const initialSubmissions: Submission[] = [
    {
      "id": "TRX-2024-0315-A1B2C",
      "userId": "user1",
      "userName": "Dawit Abebe",
      "status": "Rejected",
      "submittedAt": "2024-03-15T09:30:00.000Z",
      "lastModifiedAt": "2025-07-09T06:32:19.264Z",
      "comments": "The budget allocation is unclear. Please provide a more detailed breakdown.",
      "projectTitle": "የክትባት ምርምር ፕሮጀክት",
      "department": "ተላላፊ በሽታዎች ምርምር",
      "goal": "የሕካምና ፈጠራ እና የቴካኖሎጂ ሽግግርን ማሳደግ",
      "objectives": [
        {
          "objective": "የሳይንሳዊ መረጃዎች፣ የፈጠራ ፣አዳዲስ እና የተሻሻሉ ምርቶች መሳሪያዎች እና ዘዴዎች ማሳደግ፣ ማምረት እና ማሸጋገር",
          "objectiveWeight": "100",
          "strategicActions": [
            {
              "action": "በሽታን መዋጋት",
              "weight": "100"
            }
          ]
        }
      ],
      "metric": "የበሽታ መቀነስ",
      "mainTask": "ሙከራ ማካሄድ",
      "mainTaskTarget": "1000 ተሳታፊዎች",
      "metricWeight": "50",
      "mainTaskWeight": "50",
      "executingBody": "ክሊኒካል ሙከራ ዳይሬክቶሬት",
      "executionTime": "1ኛ ሩብ ዓመት",
      "budgetSource": "መንግስት",
      "governmentBudgetAmount": "500000",
      "governmentBudgetCode": "6223 ለምርምር እና ለልማት አላቂ ዕቃዎች"
    },
    {
      "id": "TRX-2025-0709-FOQDB",
      "userId": "user1",
      "status": "Approved",
      "submittedAt": "2025-07-09T08:31:37.570Z",
      "lastModifiedAt": "2025-07-09T11:53:29.221Z",
      "userName": "Abeba Tesfaye",
      "projectTitle": "የማህበረሰብ ጤና ትምህርት",
      "department": "የህብረተሰብ ጤና ምርምር",
      "goal": "በማስረጃ ላይ የተመሰረተ ዉሳኔ አሰጣጥን ማሳደግ",
       "objectives": [
        {
          "objective": "በምርምር ውስጥ የማህበረሰቡን ተሳትፎ ማሳደግ",
          "objectiveWeight": "100",
          "strategicActions": [
            {
              "action": "የጤና ግንዛቤ ማስጨበጫ ዘመቻዎችን ማካሄድ",
              "weight": "100"
            }
          ]
        }
      ],
      "metric": "የዘመቻ ተደራሽነት",
      "mainTask": "ወርክሾፖችን ማደራጀት",
      "mainTaskTarget": "5 ወርክሾፖች",
      "metricWeight": "60",
      "mainTaskWeight": "40",
      "executingBody": "የህዝብ ግንኙነትና ኮሙኒኬሽን",
      "executionTime": "2ኛ ሩብ ዓመት",
      "budgetSource": "ግራንት",
      "grantBudgetAmount": "75000"
    },
    {
      "id": "TRX-2025-0709-R9VPX",
      "userId": "user1",
      "status": "Pending",
      "submittedAt": "2025-07-09T08:32:06.365Z",
      "lastModifiedAt": "2025-07-09T08:32:06.365Z",
      "userName": "Yonas Berhanu",
      "projectTitle": "የላብራቶሪ አቅም ግንባታ",
      "department": "የላብራቶሪ አገልግሎቶች",
      "goal": "የአሰራር ስርዓት ዉጤታማነት ማሻሻል እና ተጠያቂነትን ማረጋገጥ",
      "objectives": [
        {
          "objective": "ተቋማዊ መሠረተ ልማትን ማሻሻል",
          "objectiveWeight": "100",
          "strategicActions": [
            {
              "action": "አዲስ መሳሪያዎችን መግጠም",
              "weight": "60"
            },
            {
                "action": "የሰራተኞች ስልጠና",
                "weight": "40"
            }
          ]
        }
      ],
      "metric": "የተከናወኑ ምርመራዎች ብዛት",
      "mainTask": "የመሳሪያ ግዥ",
      "mainTaskTarget": "3 አዳዲስ መሳሪያዎች",
      "metricWeight": "70",
      "mainTaskWeight": "30",
      "executingBody": "ላብራቶሪ አስተዳደር ዳይሬክቶሬት",
      "executionTime": "4ኛ ሩብ ዓመት",
      "budgetSource": "መንግስት",
      "governmentBudgetAmount": "1200000",
      "governmentBudgetCode": "6313 ለፕላንት፣ ለማሽነሪ እና ለመሣሪያ መግዣ"
    }
  ]
