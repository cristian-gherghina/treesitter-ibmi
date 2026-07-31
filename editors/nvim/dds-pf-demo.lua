-- Minimal, isolated Neovim configuration for visually testing DDS/PF.

local repo_root = assert(os.getenv("TS_IBMI_REPO_ROOT"))
local parser_path = assert(os.getenv("TS_IBMI_DDS_PF_PARSER"))

vim.opt.background = "dark"
vim.cmd.colorscheme("habamax")

vim.treesitter.language.add("dds_pf", { path = parser_path })

vim.filetype.add({
  extension = {
    dds = "dds_pf",
    pf = "dds_pf",
    pf38 = "dds_pf",
  },
})

local query_path = repo_root .. "/grammars/dds/pf/queries/highlights.scm"
local query = table.concat(vim.fn.readfile(query_path), "\n")
vim.treesitter.query.set("dds_pf", "highlights", query)

vim.api.nvim_create_autocmd("FileType", {
  pattern = "dds_pf",
  callback = function(args)
    vim.treesitter.start(args.buf, "dds_pf")
    vim.schedule(function()
      vim.cmd("InspectTree")
    end)
  end,
})
