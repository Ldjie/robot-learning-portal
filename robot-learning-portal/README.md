# Robot Learning Portal

## Files
- `index.html`: main learning portal.
- `ppo.html`: standalone interactive PPO/MDP study module.

## Deploy with Cloudflare Pages
1. Upload these files to the root of a GitHub repository.
2. Connect the repository in Cloudflare Pages.
3. Set Framework preset to `None`, Build command to `exit 0` (or leave it empty if accepted), and Build output directory to `/` (repository root).
4. Deploy and open the assigned `*.pages.dev` address.

## Notes
Learning progress and personal notes are stored in the current browser's `localStorage`; they do not automatically sync between devices. Use Export Backup regularly.
