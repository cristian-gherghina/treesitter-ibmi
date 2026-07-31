-- Minimal, isolated Neovim configuration for visually testing a parser.

local language = assert(os.getenv("TS_IBMI_LANGUAGE"))
local parser_path = assert(os.getenv("TS_IBMI_PARSER"))
local query_path = assert(os.getenv("TS_IBMI_HIGHLIGHTS"))
local extensions = assert(os.getenv("TS_IBMI_EXTENSIONS"))

vim.opt.background = "dark"
vim.cmd.colorscheme("habamax")

vim.treesitter.language.add(language, { path = parser_path })

local extension_map = {}
for extension in extensions:gmatch("[^,]+") do
  extension_map[extension] = language
end
vim.filetype.add({ extension = extension_map })

local query = table.concat(vim.fn.readfile(query_path), "\n")
vim.treesitter.query.set(language, "highlights", query)

vim.api.nvim_create_autocmd("FileType", {
  pattern = language,
  callback = function(args)
    vim.treesitter.start(args.buf, language)
    vim.schedule(function()
      vim.cmd("InspectTree")
    end)
  end,
})
