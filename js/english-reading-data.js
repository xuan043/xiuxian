/* ============================================================
 * 四级英语修行阁 —— 阅读理解题库
 * 每篇文章：标题、正文、关键词（含释义/用法）
 * 关键词在正文中会被高亮，点击显示释义与用法
 * ============================================================ */
(function (global) {
  'use strict';

  const READING_BANK = [
    {
      id: 'r1', title: 'Online Learning', sub: '四级阅读 · 320词',
      text: `In recent years, online learning has become one of the most popular ways to study. Students can take courses from famous universities without leaving their homes. This new way of learning brings many advantages. First, it saves time and money because students do not need to travel to school. Second, learners can study at their own pace. They can watch video lessons again and again until they understand the content. Third, online courses offer a wide range of subjects, from computer science to foreign languages.

However, online learning also has some disadvantages. Some students find it difficult to stay focused when studying alone at home. Without teachers and classmates around, they may feel lonely. In addition, spending too much time in front of a computer screen is bad for their eyes. Therefore, students should make a good study plan and take regular breaks.

Despite these problems, online learning will continue to grow. With better technology and more interactive tools, it can become an even better way to gain knowledge in the future.`,
      keywords: [
        { w: 'advantages', cn: 'n. 优势，好处', usage: 'bring many advantages 带来很多好处' },
        { w: 'focused', cn: 'adj. 专注的', usage: 'stay focused 保持专注' },
        { w: 'lonely', cn: 'adj. 孤独的', usage: 'feel lonely 感到孤独' },
        { w: 'regular', cn: 'adj. 定期的，有规律的', usage: 'take regular breaks 定期休息' },
        { w: 'interactive', cn: 'adj. 互动的', usage: 'interactive tools 互动工具' }
      ]
    },
    {
      id: 'r2', title: 'Healthy Eating Habits', sub: '四级阅读 · 300词',
      text: `Eating habits have a great influence on our health. A healthy diet can help us stay energetic and prevent many diseases. First, we should eat plenty of vegetables and fruits every day. They are rich in vitamins and fiber, which are good for our body. Second, we need to reduce the amount of sugar and salt in our meals. Too much sugar can cause weight problems, while too much salt may lead to high blood pressure. Third, it is important to have breakfast. A good breakfast can improve our concentration at work or school.

Many young people enjoy fast food because it is convenient and tasty. However, fast food is often high in fat and calories. If we eat it too often, it will harm our health. Therefore, we should try to cook at home and choose fresh ingredients instead.

In conclusion, healthy eating is not difficult. By making small changes to our daily diet, we can enjoy a healthier and happier life.`,
      keywords: [
        { w: 'influence', cn: 'n./v. 影响', usage: 'have a great influence on 对…有很大影响' },
        { w: 'prevent', cn: 'v. 预防', usage: 'prevent diseases 预防疾病' },
        { w: 'reduce', cn: 'v. 减少', usage: 'reduce the amount of 减少…的量' },
        { w: 'concentration', cn: 'n. 专注，集中', usage: 'improve concentration 提高专注力' },
        { w: 'convenient', cn: 'adj. 方便的', usage: 'be convenient 方便' },
        { w: 'ingredients', cn: 'n. 原料，食材', usage: 'fresh ingredients 新鲜食材' }
      ]
    },
    {
      id: 'r3', title: 'The Power of Reading', sub: '四级阅读 · 330词',
      text: `Reading is one of the most valuable habits a person can develop. It opens the door to knowledge and helps us understand the world better. People who read regularly often have better vocabulary and stronger thinking skills. They can express their ideas more clearly and make better decisions.

Books can also reduce stress. When we read an interesting story, we forget our worries for a while. Studies show that reading for just six minutes can lower heart rate and relax muscles. This makes reading a simple but effective way to improve mental health.

In the digital age, many people prefer to read on phones and tablets. E-books are easy to carry and often cheaper than paper books. However, some readers believe that paper books provide a better experience because they cause less eye strain. No matter which format we choose, the most important thing is to keep reading.

In short, reading is a lifelong journey. By spending a little time on it every day, we can gain wisdom and enjoy inner peace.`,
      keywords: [
        { w: 'valuable', cn: 'adj. 有价值的', usage: 'valuable habits 有价值的习惯' },
        { w: 'vocabulary', cn: 'n. 词汇', usage: 'better vocabulary 更好的词汇量' },
        { w: 'reduce', cn: 'v. 减少', usage: 'reduce stress 减压' },
        { w: 'effective', cn: 'adj. 有效的', usage: 'effective way 有效的方法' },
        { w: 'format', cn: 'n. 形式，格式', usage: 'which format 哪种形式' },
        { w: 'wisdom', cn: 'n. 智慧', usage: 'gain wisdom 获得智慧' }
      ]
    },
    {
      id: 'r4', title: 'Environmental Protection', sub: '四级阅读 · 340词',
      text: `Environmental protection has become a global issue. Every day, human activities produce large amounts of waste and pollution. If we do not take action, the earth will become a less suitable place to live. Therefore, it is everyone's duty to protect the environment.

There are many simple ways to live a greener life. First, we should save water and electricity. Turning off the lights when leaving a room and fixing leaky taps are good habits. Second, we can reduce plastic use by bringing reusable bags when shopping. Third, choosing public transport or riding bicycles instead of driving cars can help reduce air pollution.

Governments and companies also play an important role. They should make laws to limit pollution and develop clean energy. For example, solar and wind power can replace coal in many areas. At the same time, education is necessary to raise public awareness.

In a word, protecting the environment requires efforts from every member of society. Small actions, when repeated by millions of people, can make a big difference.`,
      keywords: [
        { w: 'global', cn: 'adj. 全球的', usage: 'global issue 全球性问题' },
        { w: 'pollution', cn: 'n. 污染', usage: 'air pollution 空气污染' },
        { w: 'reusable', cn: 'adj. 可重复使用的', usage: 'reusable bags 环保袋' },
        { w: 'limit', cn: 'v. 限制', usage: 'limit pollution 限制污染' },
        { w: 'awareness', cn: 'n. 意识', usage: 'raise public awareness 提高公众意识' },
        { w: 'difference', cn: 'n. 差异，影响', usage: 'make a big difference 产生重大影响' }
      ]
    },
    {
      id: 'r5', title: 'The Benefits of Exercise', sub: '四级阅读 · 310词',
      text: `Exercise is essential for maintaining good health. Doctors recommend that adults do at least 150 minutes of moderate exercise every week. Regular physical activity can strengthen the heart, improve blood circulation, and help control body weight. It also reduces the risk of many diseases, such as diabetes and heart disease.

Besides physical benefits, exercise is good for mental health. When we exercise, our body produces chemicals that make us feel happy and relaxed. This is why many people say they feel less stressed after a workout. Exercise can also improve sleep quality, which is important for overall well-being.

However, some people find it hard to start exercising. The key is to choose an activity that you enjoy. Whether it is swimming, running, dancing, or playing basketball, finding fun in exercise makes it easier to keep going. Setting small goals and tracking progress can also increase motivation.

In conclusion, exercise should be part of our daily routine. It not only keeps us healthy but also makes us happier and more energetic.`,
      keywords: [
        { w: 'essential', cn: 'adj. 必不可少的', usage: 'essential for 对…必不可少' },
        { w: 'moderate', cn: 'adj. 适度的', usage: 'moderate exercise 适度运动' },
        { w: 'circulation', cn: 'n. 循环', usage: 'blood circulation 血液循环' },
        { w: 'reduce', cn: 'v. 降低', usage: 'reduce the risk of 降低…风险' },
        { w: 'motivation', cn: 'n. 动力', usage: 'increase motivation 增强动力' },
        { w: 'routine', cn: 'n. 常规，例行', usage: 'daily routine 日常惯例' }
      ]
    },
    {
      id: 'r6', title: 'Social Media and Friendship', sub: '四级阅读 · 320词',
      text: `Social media has changed the way people communicate. With platforms like WeChat and Weibo, we can keep in touch with friends and family no matter where they are. Sharing photos, videos, and daily moments has become a common part of modern life.

However, social media also brings challenges. Some people spend so much time online that they ignore real-life relationships. They may have hundreds of online friends but still feel lonely. In addition, comparing oneself with others on social media can cause anxiety and low self-esteem.

To use social media wisely, we should set time limits. It is important to balance online and offline life. Meeting friends in person and having face-to-face conversations can build deeper connections. We should also remember that what people show online is often just the bright side of their lives.

In summary, social media is a useful tool, but it should not replace real friendships. Using it in a healthy way can help us stay connected without losing ourselves.`,
      keywords: [
        { w: 'platforms', cn: 'n. 平台', usage: 'social media platforms 社交媒体平台' },
        { w: 'challenges', cn: 'n. 挑战', usage: 'bring challenges 带来挑战' },
        { w: 'ignore', cn: 'v. 忽视', usage: 'ignore real-life relationships 忽视现实关系' },
        { w: 'anxiety', cn: 'n. 焦虑', usage: 'cause anxiety 引起焦虑' },
        { w: 'wisely', cn: 'adv. 明智地', usage: 'use wisely 明智使用' },
        { w: 'balance', cn: 'v./n. 平衡', usage: 'balance online and offline life 平衡线上线下生活' }
      ]
    },
    {
      id: 'r7', title: 'The Value of Volunteering', sub: '四级阅读 · 300词',
      text: `Volunteering is the act of giving time and effort to help others without expecting payment. It benefits both the community and the volunteer. Many young people choose to volunteer during their free time because it gives them a sense of purpose and satisfaction.

Through volunteering, people can learn new skills and gain valuable experience. For example, working at an animal shelter can teach responsibility, while helping in a hospital can improve communication skills. These experiences are also helpful when applying for jobs or scholarships.

Moreover, volunteering helps build a stronger society. When people work together to solve problems, they create a sense of belonging and trust. Small actions, such as cleaning a park or teaching children, can make the community a better place.

In conclusion, volunteering is a meaningful activity. It not only helps those in need but also helps volunteers grow as individuals. Everyone can find a way to contribute to society.`,
      keywords: [
        { w: 'volunteering', cn: 'n. 志愿服务', usage: 'the value of volunteering 志愿服务的价值' },
        { w: 'satisfaction', cn: 'n. 满足感', usage: 'a sense of satisfaction 满足感' },
        { w: 'responsibility', cn: 'n. 责任', usage: 'teach responsibility 培养责任感' },
        { w: 'applying', cn: 'v. 申请', usage: 'applying for jobs 申请工作' },
        { w: 'belonging', cn: 'n. 归属感', usage: 'sense of belonging 归属感' },
        { w: 'contribute', cn: 'v. 贡献', usage: 'contribute to society 为社会做贡献' }
      ]
    },
    {
      id: 'r8', title: 'Time Management Skills', sub: '四级阅读 · 315词',
      text: `Time management is an important skill for students and workers. People who manage their time well can finish more tasks and feel less stressed. On the other hand, poor time management often leads to procrastination and missed deadlines.

One useful method is to make a to-do list every morning. Writing down tasks helps us understand what needs to be done first. Another method is to break large tasks into smaller steps. This makes difficult work seem easier and allows us to see progress. We should also avoid spending too much time on unimportant activities, such as watching videos for hours.

Technology can help with time management, too. Calendar apps and reminder tools can keep us organized. However, we should not rely too much on technology. The most important thing is self-discipline.

In short, learning to manage time takes practice. By using the right methods, we can make better use of every day and achieve our goals more easily.`,
      keywords: [
        { w: 'management', cn: 'n. 管理', usage: 'time management 时间管理' },
        { w: 'procrastination', cn: 'n. 拖延', usage: 'lead to procrastination 导致拖延' },
        { w: 'deadlines', cn: 'n. 截止日期', usage: 'missed deadlines 错过截止期限' },
        { w: 'method', cn: 'n. 方法', usage: 'useful method 有用的方法' },
        { w: 'organized', cn: 'adj. 有条理的', usage: 'keep organized 保持有条理' },
        { w: 'self-discipline', cn: 'n. 自律', usage: 'self-discipline 自律' }
      ]
    }
  ];

  // 每日阅读篇数
  const DAILY_READING_LIMIT = 2;

  global.XReadingData = { READING_BANK, DAILY_READING_LIMIT };
})(window);
