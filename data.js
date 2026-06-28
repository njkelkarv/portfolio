const public_name_git = ['s', 't', 'f', 'i', 'R', 'l', 'e', 'x', 'i', 'P'].join("").split("").reverse().join("");;
const public_name = ['s', 't', 'f', 'i', 'R', 'l', 'e', 'x', 'o', 'V'].join("").split("").reverse().join("");;
const public_github_url = `https://github.com/${public_name_git}`;

const data = {
    name: {
        full: "Nikhil Kelkar",
        lines: [
            "Interested in Compilers, Graphics and better Program Representations",
            "Enjoy making Educational Videos, Animations, Games",
            "Most of my public work is under the name \"VoxelRifts\"",
        ],
    },
    education: [
        { degree: "B.Tech. Computer Engineering", school: "Vishwakarma Institute of Technology", year: "2023 - now" },
    ],
    projects: [
        { title: "Project A", description: "What it does.", url: "#" },
        { title: "Project B", description: "What it does.", url: "#" },
    ],
    research: [
        { title: "Paper Title", venue: "Conference / Journal, Year", url: "#" },
    ],
    experience: [
        { role: "Intern", org: "IIT Gandhinagar CCL Lab", period: "June 2026 - August 2026", notes: "Worked on custom firmware, bootloader, and ported many libraries to work with a new RiscV-based SoC." },
    ],
    links: [
        { label: "GitHub", url: public_github_url },
        { label: "Email", url: "mailto:njk777400@gmail.com" },
    ],
};

function render(data) {
    const $ = id => document.querySelector(`#${id}`);

    const ns = $('name');
    ns.innerHTML = `<h1>${data.name.full}</h1><div class="lines">${data.name.lines.join('<br>')}</div>`;

    data.projects.forEach(p => {
        const el = document.createElement('div');
        el.innerHTML = `<a href="${p.url}">${p.title}</a><p>${p.description}</p>`;
        $('projects').appendChild(el);
    });

    data.research.forEach(r => {
        const el = document.createElement('div');
        el.innerHTML = `<a href="${r.url}">${r.title}</a> <p><span>${r.venue}</span></p>`;
        $('research').appendChild(el);
    });

    data.experience.forEach(e => {
        const el = document.createElement('div');
        el.innerHTML = `<strong>${e.role}</strong> - ${e.org} <span>${e.period}</span><p>${e.notes}</p>`;
        $('experience').appendChild(el);
    });

    data.education.forEach(e => {
        const el = document.createElement('div');
        el.innerHTML = `<strong>${e.degree}</strong> - ${e.school} <span>${e.year}</span>`;
        $('education').appendChild(el);
    });

    const ul = document.createElement('ul');
    data.links.forEach(l => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${l.url}">${l.label}</a>`;
        ul.appendChild(li);
    });
    $('links').appendChild(ul);
}

document.addEventListener('DOMContentLoaded', () => render(data));
